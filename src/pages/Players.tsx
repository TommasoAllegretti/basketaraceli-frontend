import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, ChevronLeft, ChevronRight, Trophy, Hash, Ruler } from 'lucide-react'
import { getPlayers } from '@/api/playerService'
import type { Player } from '@/models/player'

export function Players() {
  const [allPlayers, setAllPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const playersPerPage = 12

  const fetchPlayers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getPlayers()
      setAllPlayers(data)
    } catch (err) {
      setError('Failed to load players')
      console.error('Error fetching players:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlayers()
  }, [])

  // Calculate pagination
  const totalPages = Math.ceil(allPlayers.length / playersPerPage)
  const startIndex = (currentPage - 1) * playersPerPage
  const endIndex = startIndex + playersPerPage
  const currentPlayers = allPlayers.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const renderPaginationButtons = () => {
    if (totalPages <= 1) return null

    const buttons = []
    const maxVisiblePages = 5

    // Calculate start and end page numbers
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    // Previous button
    buttons.push(
      <Button
        key="prev"
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>,
    )

    // Page number buttons
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={i === currentPage ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>,
      )
    }

    // Next button
    buttons.push(
      <Button
        key="next"
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>,
    )

    return buttons
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Giocatori</h1>
        </div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Giocatori</h1>
          <p className="text-muted-foreground">Vedi tutti i giocatori</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchPlayers}>Ricarica</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!loading && allPlayers.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Giocatori</h1>
          <p className="text-muted-foreground">Vedi tutti i giocatori</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nessun giocatore</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Giocatori</h1>
        </div>
        <Button className="cursor-pointer">Aggiungi Giocatore</Button>
      </div>

      {/* Players Grid */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {currentPlayers.map((player: Player) => (
          <Card key={player.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                {player.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">#{player.jersey_number}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Trophy className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{player.position}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Ruler className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{player.height_cm} cm</span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
                <div className="text-center" title="punti a partita">
                  <div className="text-muted-foreground">PPG</div>
                  <div className="font-medium">{player.points_per_game}</div>
                </div>
                <div className="text-center" title="rimbalzi a partita">
                  <div className="text-muted-foreground">RPG</div>
                  <div className="font-medium">{player.rebounds_per_game}</div>
                </div>
                <div className="text-center" title="assist a partita">
                  <div className="text-muted-foreground">APG</div>
                  <div className="font-medium">{player.assists_per_game}</div>
                </div>
              </div>

              {player.teams.length > 0 && (
                <div className="pt-2">
                  <div className="text-xs text-muted-foreground mb-1">Squadre:</div>
                  <div className="flex flex-wrap gap-1">
                    {player.teams.map(team => (
                      <span key={team.id} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {team.abbreviation}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1 cursor-pointer">
                  Vedi
                </Button>
                <Button size="sm" variant="outline" className="flex-1 cursor-pointer">
                  Modifica
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && <div className="flex items-center justify-center gap-2">{renderPaginationButtons()}</div>}

      {/* Pagination Info */}
      {totalPages > 1 && (
        <div className="text-center text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
      )}
    </div>
  )
}

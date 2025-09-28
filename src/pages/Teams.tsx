import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Building, Trophy, ChevronLeft, ChevronRight } from 'lucide-react'
import { getTeams } from '@/api/teamService'
import type { Team } from '@/models/team'

export function Teams() {
  const [allTeams, setAllTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const teamsPerPage = 12

  const fetchTeams = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getTeams()
      setAllTeams(data)
    } catch (err) {
      setError('Failed to load teams')
      console.error('Error fetching teams:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeams()
  }, [])

  // Calculate pagination
  const totalPages = Math.ceil(allTeams.length / teamsPerPage)
  const startIndex = (currentPage - 1) * teamsPerPage
  const endIndex = startIndex + teamsPerPage
  const currentTeams = allTeams.slice(startIndex, endIndex)

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
          <h1 className="text-3xl font-bold tracking-tight">Squadre</h1>
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
          <h1 className="text-3xl font-bold tracking-tight">Squadre</h1>
          <p className="text-muted-foreground">Vedi tutte le squadre</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchTeams}>Ricarica</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!loading && allTeams.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Squadre</h1>
          <p className="text-muted-foreground">Vedi tutte le squadre</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nessuna squadra</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Squadre</h1>
        </div>
        <Button className=" cursor-pointer">Aggiungi Squadra</Button>
      </div>

      {/* Teams Grid */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {currentTeams.map((team: Team) => (
          <Card key={team.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {team.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Trophy className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{team.abbreviation ?? '-'}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{team.club?.name ?? '-'}</span>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium bg-green-100 text-green-800 px-2 py-1 rounded">
                    {team.league.name}
                  </span>
                  <span className="text-xs text-muted-foreground">ID: #{team.id}</span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground pt-2">
                <p>Creato: {new Date(team.created_at).toLocaleDateString()}</p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 cursor-pointer"
                  onClick={() => (window.location.href = `/admin/team?id=${team.id}`)}
                >
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

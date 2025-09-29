import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trophy, ChevronLeft, ChevronRight, Calendar, Hash } from 'lucide-react'
import { getLeagues } from '@/api/leagueService'
import { useAuth } from '@/contexts/AuthContext'
import type { League } from '@/models/league'

export function Leagues() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [allLeagues, setAllLeagues] = useState<League[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const leaguesPerPage = 12

  const fetchLeagues = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getLeagues()
      setAllLeagues(data)
    } catch (err) {
      setError('Impossibile caricare i campionati')
      console.error('Errore nel recupero dei campionati:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeagues()
  }, [])

  // Calcolo paginazione
  const totalPages = Math.ceil(allLeagues.length / leaguesPerPage)
  const startIndex = (currentPage - 1) * leaguesPerPage
  const endIndex = startIndex + leaguesPerPage
  const currentLeagues = allLeagues.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const renderPaginationButtons = () => {
    if (totalPages <= 1) return null

    const buttons = []
    const maxVisiblePages = 5

    // Calcola i numeri di pagina iniziale e finale
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    // Aggiusta la pagina iniziale se siamo vicini alla fine
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    // Pulsante precedente
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

    // Pulsanti numerici delle pagine
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

    // Pulsante successivo
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
          <h1 className="text-3xl font-bold tracking-tight">Campionati</h1>
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
          <h1 className="text-3xl font-bold tracking-tight">Campionati</h1>
          <p className="text-muted-foreground">Gestisci e visualizza tutti i campionati</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchLeagues}>Riprova</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!loading && allLeagues.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campionati</h1>
          <p className="text-muted-foreground">Gestisci e visualizza tutti i campionati</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nessun campionato trovato</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Intestazione */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campionati</h1>
        </div>
        {isAdmin && (
          <Button className="cursor-pointer" onClick={() => navigate('/create-league')}>
            Aggiungi Campionato
          </Button>
        )}
      </div>

      {/* Griglia Campionati */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {currentLeagues.map((league: League) => (
          <Card key={league.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                {league.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">ID: #{league.id}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Creato: {formatDate(league.created_at)}</span>
              </div>

              {league.updated_at !== league.created_at && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Aggiornato: {formatDate(league.updated_at)}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 cursor-pointer"
                  onClick={() => (window.location.href = `/admin/league?id=${league.id}`)}
                >
                  Vedi
                </Button>
                {isAdmin && (
                  <Button size="sm" variant="outline" className="flex-1 cursor-pointer">
                    Modifica
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Paginazione */}
      {totalPages > 1 && <div className="flex items-center justify-center gap-2">{renderPaginationButtons()}</div>}

      {/* Info Paginazione */}
      {totalPages > 1 && (
        <div className="text-center text-sm text-muted-foreground">
          Pagina {currentPage} di {totalPages}
        </div>
      )}
    </div>
  )
}

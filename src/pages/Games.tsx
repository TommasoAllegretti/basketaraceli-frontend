import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, ChevronLeft, ChevronRight, Users } from 'lucide-react'
import { getGames } from '@/api/gameService'
import type { Game } from '@/models/game'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'
import { ErrorDisplay } from '@/components/ErrorDisplay'
import { EmptyState } from '@/components/EmptyState'

function GamesContent() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [allGames, setAllGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const gamesPerPage = 12

  const fetchGames = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getGames()
      setAllGames(data)
    } catch (err: any) {
      console.error('Errore nel caricamento delle partite:', err)

      // Enhanced error handling with specific error types
      if (err && typeof err === 'object' && 'response' in err) {
        const response = err.response
        if (response?.status === 403) {
          setError('Non autorizzato ad accedere alle partite')
        } else if (response?.status === 404) {
          setError('Servizio partite non disponibile')
        } else if (response?.status >= 500) {
          setError('Errore del server. Riprova più tardi')
        } else if (!navigator.onLine) {
          setError('Connessione internet non disponibile')
        } else {
          setError('Impossibile caricare le partite')
        }
      } else if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Errore di connessione. Verifica la tua connessione internet')
      } else {
        setError('Impossibile caricare le partite')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGames()
  }, [])

  // Calculate pagination
  const totalPages = Math.ceil(allGames.length / gamesPerPage)
  const startIndex = (currentPage - 1) * gamesPerPage
  const endIndex = startIndex + gamesPerPage
  const currentGames = allGames.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
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
        className="min-w-[40px] min-h-[40px] touch-manipulation"
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
          className="min-w-[40px] min-h-[40px] touch-manipulation"
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
        className="min-w-[40px] min-h-[40px] touch-manipulation"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>,
    )

    return buttons
  }

  if (loading) {
    return <LoadingSkeleton type="list" count={6} title="Partite" />
  }

  if (error) {
    const getErrorType = () => {
      if (error.includes('connessione') || error.includes('internet')) return 'network'
      if (error.includes('autorizzato')) return 'auth'
      if (error.includes('non disponibile')) return 'notfound'
      return 'generic'
    }

    return (
      <ErrorDisplay
        error={error}
        onRetry={fetchGames}
        title="Partite"
        type={getErrorType()}
        showDetails={true}
        details={error}
      />
    )
  }

  if (!loading && allGames.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Partite</h1>
          </div>
          {isAdmin && (
            <Button className="cursor-pointer" onClick={() => navigate('/create-game')}>
              Aggiungi Partita
            </Button>
          )}
        </div>
        <EmptyState
          icon="games"
          title="Nessuna partita trovata"
          description="Non ci sono partite programmate al momento. Gli amministratori possono aggiungere nuove partite."
          actionLabel="Aggiungi Prima Partita"
          onAction={isAdmin ? () => navigate('/create-game') : undefined}
          showAction={isAdmin}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Partite</h1>
        </div>
        {isAdmin && (
          <Button className="cursor-pointer w-full sm:w-auto" onClick={() => navigate('/create-game')}>
            Aggiungi Partita
          </Button>
        )}
      </div>

      {/* Games Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {currentGames.map((game: Game) => (
          <Card
            key={game.id}
            className="hover:shadow-md transition-shadow flex flex-col cursor-pointer touch-manipulation"
            onClick={() => navigate(`/game?id=${game.id}`)}
          >
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="truncate">{formatDate(game.date)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <div className="space-y-4 flex-1">
                {/* Teams */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium text-sm sm:text-base truncate">{game.home_team.name}</span>
                    </div>
                    <span className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">Casa</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium text-sm sm:text-base truncate">{game.away_team.name}</span>
                    </div>
                    <span className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">Ospite</span>
                  </div>
                </div>

                {/* Final Scores */}
                {(game.home_team_total_score !== null || game.away_team_total_score !== null) && (
                  <div className="border-t pt-2 sm:pt-3">
                    <div className="text-xs sm:text-sm text-muted-foreground mb-2">Punteggio Finale</div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-base sm:text-lg">{game.home_team_total_score ?? '-'}</span>
                      <span className="text-muted-foreground text-sm">-</span>
                      <span className="font-bold text-base sm:text-lg">{game.away_team_total_score ?? '-'}</span>
                    </div>
                  </div>
                )}

                {/* Quarter Scores */}
                {(game.home_team_first_quarter_score !== null ||
                  game.home_team_second_quarter_score !== null ||
                  game.home_team_third_quarter_score !== null ||
                  game.home_team_fourth_quarter_score !== null) && (
                  <div className="border-t pt-2 sm:pt-3">
                    <div className="text-xs sm:text-sm text-muted-foreground mb-2">Punteggi per Quarto</div>
                    <div className="grid grid-cols-4 gap-1 text-xs">
                      <div className="text-center">
                        <div className="text-muted-foreground text-xs">Q1</div>
                        <div className="font-medium text-xs">
                          {game.home_team_first_quarter_score ?? '-'} - {game.away_team_first_quarter_score ?? '-'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-muted-foreground text-xs">Q2</div>
                        <div className="font-medium text-xs">
                          {game.home_team_second_quarter_score ?? '-'} - {game.away_team_second_quarter_score ?? '-'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-muted-foreground text-xs">Q3</div>
                        <div className="font-medium text-xs">
                          {game.home_team_third_quarter_score ?? '-'} - {game.away_team_third_quarter_score ?? '-'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-muted-foreground text-xs">Q4</div>
                        <div className="font-medium text-xs">
                          {game.home_team_fourth_quarter_score ?? '-'} - {game.away_team_fourth_quarter_score ?? '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Team Abbreviations */}
                <div className="pt-2">
                  <div className="flex justify-center gap-4">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {game.home_team.abbreviation}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">vs</span>
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                      {game.away_team.abbreviation}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap px-4 sm:px-0">
          {renderPaginationButtons()}
        </div>
      )}

      {/* Pagination Info */}
      {totalPages > 1 && (
        <div className="text-center text-sm text-muted-foreground">
          Pagina {currentPage} di {totalPages}
        </div>
      )}
    </div>
  )
}

export function Games() {
  return (
    <ErrorBoundary>
      <GamesContent />
    </ErrorBoundary>
  )
}

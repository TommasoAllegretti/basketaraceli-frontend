import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, TrendingUp, Users, Calendar } from 'lucide-react'
import { getGameStats } from '@/api/gameStatService'
import type { GameStat } from '@/models/gameStat'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'
import { ErrorDisplay } from '@/components/ErrorDisplay'
import { EmptyState } from '@/components/EmptyState'

function GameStatsContent() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [allGameStats, setAllGameStats] = useState<GameStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const statsPerPage = 12

  const fetchGameStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getGameStats()
      setAllGameStats(data)
    } catch (err: any) {
      console.error('Errore nel caricamento delle statistiche:', err)

      if (err && typeof err === 'object' && 'response' in err) {
        const response = err.response
        if (response?.status === 403) {
          setError('Non autorizzato ad accedere alle statistiche')
        } else if (response?.status === 404) {
          setError('Servizio statistiche non disponibile')
        } else if (response?.status >= 500) {
          setError('Errore del server. Riprova più tardi')
        } else if (!navigator.onLine) {
          setError('Connessione internet non disponibile')
        } else {
          setError('Impossibile caricare le statistiche')
        }
      } else if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Errore di connessione. Verifica la tua connessione internet')
      } else {
        setError('Impossibile caricare le statistiche')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGameStats()
  }, [])

  // Calculate pagination
  const totalPages = Math.ceil(allGameStats.length / statsPerPage)
  const startIndex = (currentPage - 1) * statsPerPage
  const endIndex = startIndex + statsPerPage
  const currentStats = allGameStats.slice(startIndex, endIndex)

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

  const formatPercentage = (value: string | number | null) => {
    if (value === null || value === undefined) return '-'
    if (typeof value === 'string') {
      const numValue = parseFloat(value)
      if (isNaN(numValue)) return '-'
      return `${numValue.toFixed(1)}%`
    }
    return `${value.toFixed(1)}%`
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
    return <LoadingSkeleton type="grid" count={6} title="Statistiche Partite" />
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
        onRetry={fetchGameStats}
        title="Statistiche Partite"
        type={getErrorType()}
        showDetails={true}
        details={error}
      />
    )
  }

  if (!loading && allGameStats.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Statistiche Partite</h1>
          </div>
          {isAdmin && (
            <Button className="cursor-pointer" onClick={() => navigate('/create-game-stat')}>
              Aggiungi Statistiche
            </Button>
          )}
        </div>
        <EmptyState
          icon="stats"
          title="Nessuna statistica trovata"
          description="Non ci sono statistiche di partita disponibili. Gli amministratori possono aggiungere nuove statistiche."
          actionLabel="Aggiungi Prime Statistiche"
          onAction={isAdmin ? () => navigate('/create-game-stat') : undefined}
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Statistiche Partite</h1>
        </div>
        {isAdmin && (
          <Button className="cursor-pointer w-full sm:w-auto" onClick={() => navigate('/create-game-stat')}>
            Aggiungi Statistiche
          </Button>
        )}
      </div>

      {/* Game Stats Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {currentStats.map((gameStat: GameStat) => (
          <Card
            key={gameStat.id}
            className="hover:shadow-md transition-shadow flex flex-col cursor-pointer touch-manipulation"
            onClick={() => navigate(`/game-stat?id=${gameStat.id}`)}
          >
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="truncate">{gameStat.team.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <div className="space-y-4 flex-1">
                {/* Game Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-muted-foreground truncate">
                      {formatDate(gameStat.game.date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs sm:text-sm truncate">Partita #{gameStat.game.id}</span>
                  </div>
                </div>

                {/* Key Statistics */}
                <div className="border-t pt-2 sm:pt-3">
                  <div className="text-xs sm:text-sm text-muted-foreground mb-2">Statistiche Principali</div>
                  <div className="grid grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground truncate">Punti:</span>
                      <span className="font-medium">{gameStat.points ?? '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground truncate">Rimbalzi:</span>
                      <span className="font-medium">{gameStat.total_rebounds ?? '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground truncate">Assist:</span>
                      <span className="font-medium">{gameStat.assists ?? '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground truncate">P. Rubate:</span>
                      <span className="font-medium">{gameStat.steals ?? '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Shooting Percentages */}
                <div className="border-t pt-2 sm:pt-3">
                  <div className="text-xs sm:text-sm text-muted-foreground mb-2">Percentuali di Tiro</div>
                  <div className="space-y-1 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground truncate">Campo:</span>
                      <span className="font-medium">{formatPercentage(gameStat.field_goal_percentage)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground truncate">3 Punti:</span>
                      <span className="font-medium">
                        {formatPercentage(gameStat.three_point_field_goal_percentage)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground truncate">Liberi:</span>
                      <span className="font-medium">{formatPercentage(gameStat.free_throw_percentage)}</span>
                    </div>
                  </div>
                </div>

                {/* Team Badge */}
                <div className="pt-2">
                  <div className="flex justify-center">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {gameStat.team.abbreviation}
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

export function GameStats() {
  return (
    <ErrorBoundary>
      <GameStatsContent />
    </ErrorBoundary>
  )
}

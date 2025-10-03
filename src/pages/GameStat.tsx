import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, ArrowLeft, Target, Users, TrendingUp, Shield, Edit, Trash2, AlertCircle } from 'lucide-react'
import { getGameStat, deleteGameStat } from '@/api/gameStatService'
import { useAuth } from '@/contexts/AuthContext'
import type { GameStat as GameStatType } from '@/models/gameStat'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'
import { ErrorDisplay } from '@/components/ErrorDisplay'

function GameStatContent() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const gameStatId = searchParams.get('id')

  const [gameStat, setGameStat] = useState<GameStatType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const fetchGameStat = async (id: number) => {
    try {
      setLoading(true)
      setError(null)
      const data = await getGameStat(id)
      setGameStat(data)
    } catch (err: any) {
      console.error('Errore nel caricamento delle statistiche:', err)

      if (err && typeof err === 'object' && 'response' in err) {
        const response = err.response
        if (response?.status === 404) {
          setError('Statistiche non trovate')
        } else if (response?.status === 403) {
          setError('Non autorizzato ad accedere a queste statistiche')
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
    if (gameStatId) {
      const id = parseInt(gameStatId, 10)
      if (!isNaN(id)) {
        fetchGameStat(id)
      } else {
        setError('ID statistiche non valido')
        setLoading(false)
      }
    } else {
      setError('ID statistiche non fornito')
      setLoading(false)
    }
  }, [gameStatId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
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

  const formatStat = (value: number | null) => {
    if (value === null || value === undefined) return '-'
    return value.toString()
  }

  const handleDelete = async () => {
    if (!gameStat) return

    try {
      setDeleteLoading(true)
      await deleteGameStat(gameStat.id)
      navigate('/game-stats')
    } catch (err: unknown) {
      console.error("Errore nell'eliminazione delle statistiche:", err)
      setError('Impossibile eliminare le statistiche. Riprova più tardi.')
    } finally {
      setDeleteLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => navigate('/game-stats')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alle statistiche
          </Button>
        </div>
        <LoadingSkeleton type="detail" title="Statistiche Partita" />
      </div>
    )
  }

  if (error) {
    const getErrorType = () => {
      if (error.includes('connessione') || error.includes('internet')) return 'network'
      if (error.includes('autorizzato')) return 'auth'
      if (error.includes('non trovate')) return 'notfound'
      return 'generic'
    }

    return (
      <ErrorDisplay
        error={error}
        onRetry={gameStatId ? () => fetchGameStat(parseInt(gameStatId, 10)) : undefined}
        onBack={() => navigate('/game-stats')}
        title="Statistiche Partita"
        type={getErrorType()}
        showDetails={true}
        details={error}
      />
    )
  }

  if (!gameStat) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-4">
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer touch-manipulation min-h-[44px]"
          onClick={() => navigate('/game-stats')}
        >
          <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Torna alle statistiche</span>
          <span className="sm:hidden">Indietro</span>
        </Button>
      </div>

      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight flex items-start sm:items-center gap-2 sm:gap-3">
          <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0 mt-1 sm:mt-0" />
          <span className="break-words">Statistiche - {gameStat.team.name}</span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">
          Partita #{gameStat.game.id} - {formatDate(gameStat.game.date)}
        </p>
      </div>

      {/* Game and Team Information */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Team Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Informazioni Squadra
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Squadra</p>
              <p className="text-lg font-semibold">
                {gameStat.team.name} ({gameStat.team.abbreviation})
              </p>
              <p className="text-sm text-muted-foreground">
                {gameStat.team.club.name} - {gameStat.team.league.name}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Partita</p>
              <p className="text-sm text-muted-foreground">Partita #{gameStat.game.id}</p>
              <p className="text-sm text-muted-foreground">{formatDate(gameStat.game.date)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Overall Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Prestazione Generale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
              <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-2">{formatStat(gameStat.points)}</div>
                <div className="text-xs sm:text-sm font-medium">Punti</div>
              </div>
              <div className="p-3 sm:p-4 bg-green-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-green-600 mb-2">
                  {formatStat(gameStat.total_rebounds)}
                </div>
                <div className="text-xs sm:text-sm font-medium">Rimbalzi</div>
              </div>
              <div className="p-3 sm:p-4 bg-purple-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-purple-600 mb-2">{formatStat(gameStat.assists)}</div>
                <div className="text-xs sm:text-sm font-medium">Assist</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shooting Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Statistiche di Tiro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
            {/* Field Goals */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Tiri dal Campo</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Realizzati</span>
                  <span className="font-medium">{formatStat(gameStat.field_goals_made)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tentati</span>
                  <span className="font-medium">{formatStat(gameStat.field_goals_attempted)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium">Percentuale</span>
                  <span className="font-bold text-blue-600">{formatPercentage(gameStat.field_goal_percentage)}</span>
                </div>
              </div>
            </div>

            {/* Three Pointers */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Tiri da 3 Punti</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Realizzati</span>
                  <span className="font-medium">{formatStat(gameStat.three_point_field_goals_made)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tentati</span>
                  <span className="font-medium">{formatStat(gameStat.three_point_field_goals_attempted)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium">Percentuale</span>
                  <span className="font-bold text-green-600">
                    {formatPercentage(gameStat.three_point_field_goal_percentage)}
                  </span>
                </div>
              </div>
            </div>

            {/* Free Throws */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Tiri Liberi</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Realizzati</span>
                  <span className="font-medium">{formatStat(gameStat.free_throws_made)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tentati</span>
                  <span className="font-medium">{formatStat(gameStat.free_throws_attempted)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium">Percentuale</span>
                  <span className="font-bold text-purple-600">{formatPercentage(gameStat.free_throw_percentage)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Two Pointers */}
          {(gameStat.two_point_field_goals_made !== null || gameStat.two_point_field_goals_attempted !== null) && (
            <div className="mt-6 pt-6 border-t">
              <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Tiri da 2 Punti</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Realizzati</span>
                      <span className="font-medium">{formatStat(gameStat.two_point_field_goals_made)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Tentati</span>
                      <span className="font-medium">{formatStat(gameStat.two_point_field_goals_attempted)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-sm font-medium">Percentuale</span>
                      <span className="font-bold text-orange-600">
                        {formatPercentage(gameStat.two_point_field_goal_percentage)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rebounds Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Rimbalzi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-3">
            <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-2">
                {formatStat(gameStat.offensive_rebounds)}
              </div>
              <div className="text-xs sm:text-sm font-medium">Rimbalzi Offensivi</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-green-600 mb-2">
                {formatStat(gameStat.defensive_rebounds)}
              </div>
              <div className="text-xs sm:text-sm font-medium">Rimbalzi Difensivi</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-purple-600 mb-2">
                {formatStat(gameStat.total_rebounds)}
              </div>
              <div className="text-xs sm:text-sm font-medium">Rimbalzi Totali</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assists and Playmaking */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gioco di Squadra
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:gap-4 grid-cols-2">
              <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-green-600 mb-2">{formatStat(gameStat.assists)}</div>
                <div className="text-xs sm:text-sm font-medium">Assist</div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-red-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-red-600 mb-2">{formatStat(gameStat.turnovers)}</div>
                <div className="text-xs sm:text-sm font-medium">Palle Perse</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Defense Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Difesa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:gap-3 lg:gap-4 grid-cols-3">
              <div className="text-center p-2 sm:p-3 lg:p-4 bg-blue-50 rounded-lg">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600 mb-1 sm:mb-2">
                  {formatStat(gameStat.steals)}
                </div>
                <div className="text-xs sm:text-sm font-medium">Palle Rubate</div>
              </div>
              <div className="text-center p-2 sm:p-3 lg:p-4 bg-green-50 rounded-lg">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 mb-1 sm:mb-2">
                  {formatStat(gameStat.blocks)}
                </div>
                <div className="text-xs sm:text-sm font-medium">Stoppate</div>
              </div>
              <div className="text-center p-2 sm:p-3 lg:p-4 bg-yellow-50 rounded-lg">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-600 mb-1 sm:mb-2">
                  {formatStat(gameStat.personal_fouls)}
                </div>
                <div className="text-xs sm:text-sm font-medium">Falli</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Azioni</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                variant="outline"
                onClick={() => navigate(`/edit-game-stat?id=${gameStat.id}`)}
                className="w-full sm:w-auto touch-manipulation min-h-[44px]"
              >
                <Edit className="h-4 w-4 mr-2" />
                Modifica Statistiche
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deleteLoading}
                className="w-full sm:w-auto touch-manipulation min-h-[44px]"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Elimina
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conferma Eliminazione */}
      {showDeleteConfirm && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Conferma Eliminazione
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Sei sicuro di voler eliminare le statistiche di <strong>{gameStat.team.name}</strong> per la{' '}
              <strong>Partita #{gameStat.game.id}</strong>? Questa azione non può essere annullata.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteLoading}
                className="w-full sm:w-auto touch-manipulation min-h-[44px]"
              >
                {deleteLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Eliminazione...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Elimina Definitivamente
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteLoading}
                className="w-full sm:w-auto touch-manipulation min-h-[44px]"
              >
                Annulla
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export function GameStat() {
  return (
    <ErrorBoundary>
      <GameStatContent />
    </ErrorBoundary>
  )
}

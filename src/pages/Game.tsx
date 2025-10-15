import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trophy, ArrowLeft, Calendar, Users, Target, BarChart3, Edit, Trash2, AlertCircle } from 'lucide-react'
import { getGame, deleteGame } from '@/api/gameService'
import { useAuth } from '@/contexts/AuthContext'
import type { Game as GameType } from '@/models/game'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'
import { ErrorDisplay } from '@/components/ErrorDisplay'

function GameContent() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const gameId = searchParams.get('id')

  const [game, setGame] = useState<GameType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const fetchGame = async (id: number) => {
    try {
      setLoading(true)
      setError(null)
      const data = await getGame(id)
      setGame(data)
    } catch (err: any) {
      console.error('Errore nel caricamento della partita:', err)

      if (err && typeof err === 'object' && 'response' in err) {
        const response = err.response
        if (response?.status === 404) {
          setError('Partita non trovata')
        } else if (response?.status === 403) {
          setError('Non autorizzato ad accedere a questa partita')
        } else if (response?.status >= 500) {
          setError('Errore del server. Riprova più tardi')
        } else if (!navigator.onLine) {
          setError('Connessione internet non disponibile')
        } else {
          setError('Impossibile caricare le informazioni della partita')
        }
      } else if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Errore di connessione. Verifica la tua connessione internet')
      } else {
        setError('Impossibile caricare le informazioni della partita')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (gameId) {
      const id = parseInt(gameId, 10)
      if (!isNaN(id)) {
        fetchGame(id)
      } else {
        setError('ID partita non valido')
        setLoading(false)
      }
    } else {
      setError('ID partita non fornito')
      setLoading(false)
    }
  }, [gameId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleDelete = async () => {
    if (!game) return

    try {
      setDeleteLoading(true)
      await deleteGame(game.id)
      navigate('/games')
    } catch (err: any) {
      console.error("Errore nell'eliminazione della partita:", err)
      setError('Impossibile eliminare la partita. Riprova più tardi.')
    } finally {
      setDeleteLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => navigate('/games')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alle partite
          </Button>
        </div>
        <LoadingSkeleton type="detail" title="Partita" />
      </div>
    )
  }

  if (error) {
    const getErrorType = () => {
      if (error.includes('connessione') || error.includes('internet')) return 'network'
      if (error.includes('autorizzato')) return 'auth'
      if (error.includes('non trovata')) return 'notfound'
      return 'generic'
    }

    return (
      <ErrorDisplay
        error={error}
        onRetry={gameId ? () => fetchGame(parseInt(gameId, 10)) : undefined}
        onBack={() => navigate('/games')}
        title="Partita"
        type={getErrorType()}
        showDetails={true}
        details={error}
      />
    )
  }

  if (!game) {
    return null
  }

  const hasScores = game.home_team_total_score !== null && game.away_team_total_score !== null
  const hasQuarterScores =
    game.home_team_first_quarter_score !== null ||
    game.home_team_second_quarter_score !== null ||
    game.home_team_third_quarter_score !== null ||
    game.home_team_fourth_quarter_score !== null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-4">
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer touch-manipulation"
          onClick={() => navigate('/games')}
        >
          <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Torna alle partite</span>
          <span className="sm:hidden">Indietro</span>
        </Button>
      </div>

      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight flex items-start sm:items-center gap-2 sm:gap-3">
          <Trophy className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0 mt-1 sm:mt-0" />
          <span className="break-words">
            {game.home_team.name} vs {game.away_team.name}
          </span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">
          {formatDate(game.date)} alle {formatTime(game.date)}
        </p>
      </div>

      {/* Game Information Grid */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Game Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Dettagli Partita
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Squadra Casa</p>
                <p className="text-sm text-muted-foreground">
                  {game.home_team.name} ({game.home_team.abbreviation})
                </p>
                <p className="text-xs text-muted-foreground">
                  {game.home_team.club.name} - {game.home_team.league.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Squadra Ospite</p>
                <p className="text-sm text-muted-foreground">
                  {game.away_team.name} ({game.away_team.abbreviation})
                </p>
                <p className="text-xs text-muted-foreground">
                  {game.away_team.club.name} - {game.away_team.league.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Data e Ora</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(game.date)} alle {formatTime(game.date)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Final Scores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Punteggio Finale
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasScores ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 text-center">
                <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-2">{game.home_team_total_score}</div>
                  <div className="text-xs sm:text-sm font-medium truncate">{game.home_team.abbreviation}</div>
                  <div className="text-xs text-muted-foreground">Casa</div>
                </div>
                <div className="p-3 sm:p-4 bg-red-50 rounded-lg">
                  <div className="text-xl sm:text-2xl font-bold text-red-600 mb-2">{game.away_team_total_score}</div>
                  <div className="text-xs sm:text-sm font-medium truncate">{game.away_team.abbreviation}</div>
                  <div className="text-xs text-muted-foreground">Ospite</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <Target className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base text-muted-foreground">Punteggi non ancora disponibili</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quarter Scores */}
      {hasQuarterScores && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Punteggi per Quarto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 min-w-0">Squadra</th>
                    <th className="text-center py-2 px-1">1° Q</th>
                    <th className="text-center py-2 px-1">2° Q</th>
                    <th className="text-center py-2 px-1">3° Q</th>
                    <th className="text-center py-2 px-1">4° Q</th>
                    <th className="text-center py-2 px-1 font-bold">Tot</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 font-medium min-w-0">
                      <div className="truncate">
                        {game.home_team.abbreviation}
                        <span className="text-xs text-muted-foreground ml-1 hidden sm:inline">(Casa)</span>
                      </div>
                    </td>
                    <td className="text-center py-2 px-1">{game.home_team_first_quarter_score ?? '-'}</td>
                    <td className="text-center py-2 px-1">{game.home_team_second_quarter_score ?? '-'}</td>
                    <td className="text-center py-2 px-1">{game.home_team_third_quarter_score ?? '-'}</td>
                    <td className="text-center py-2 px-1">{game.home_team_fourth_quarter_score ?? '-'}</td>
                    <td className="text-center py-2 px-1 font-bold">{game.home_team_total_score ?? '-'}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-medium min-w-0">
                      <div className="truncate">
                        {game.away_team.abbreviation}
                        <span className="text-xs text-muted-foreground ml-1 hidden sm:inline">(Ospite)</span>
                      </div>
                    </td>
                    <td className="text-center py-2 px-1">{game.away_team_first_quarter_score ?? '-'}</td>
                    <td className="text-center py-2 px-1">{game.away_team_second_quarter_score ?? '-'}</td>
                    <td className="text-center py-2 px-1">{game.away_team_third_quarter_score ?? '-'}</td>
                    <td className="text-center py-2 px-1">{game.away_team_fourth_quarter_score ?? '-'}</td>
                    <td className="text-center py-2 px-1 font-bold">{game.away_team_total_score ?? '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Player Statistics */}
      {game.stats && game.stats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Statistiche Giocatori
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {game.stats.map(stat => (
                <div key={stat.id} className="p-3 sm:p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm sm:text-base truncate">Giocatore #{stat.player_id}</h3>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded flex-shrink-0">
                      {Math.floor((stat.seconds_played ?? 0) / 60)}:{(stat.seconds_played ?? 0) % 60}min
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-base sm:text-lg">{stat.points ?? 0}</div>
                      <div className="text-xs text-muted-foreground">Punti</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-base sm:text-lg">{stat.total_rebounds ?? 0}</div>
                      <div className="text-xs text-muted-foreground">Rimbalzi</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-base sm:text-lg">{stat.assists ?? 0}</div>
                      <div className="text-xs text-muted-foreground">Assist</div>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                    {stat.field_goal_percentage && <div>Tiri: {stat.field_goal_percentage}%</div>}
                    {stat.efficiency !== null && <div>Efficienza: {stat.efficiency}</div>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
                onClick={() => navigate(`/edit-game?id=${game.id}`)}
                className="w-full sm:w-auto touch-manipulation"
              >
                <Edit className="h-4 w-4 mr-2" />
                Modifica Partita
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deleteLoading}
                className="w-full sm:w-auto touch-manipulation"
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
              Sei sicuro di voler eliminare la partita{' '}
              <strong>
                {game.home_team.name} vs {game.away_team.name}
              </strong>
              ? Questa azione non può essere annullata e rimuoverà anche tutte le statistiche associate.
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

export function Game() {
  return (
    <ErrorBoundary>
      <GameContent />
    </ErrorBoundary>
  )
}

import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Target,
  Users,
  Trophy,
  Timer,
  AlertCircle,
  CheckCircle,
  XCircle,
  Zap,
  Shield,
} from 'lucide-react'
import { getGame } from '@/api/gameService'
import { recordAction as recordPlayerAction, undoAction as undoPlayerAction } from '@/api/playerStatService'
import type { Game as GameType } from '@/models/game'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'
import { ErrorDisplay } from '@/components/ErrorDisplay'

// Types for player stats
interface PlayerStat {
  id?: number
  player_id: number
  game_id: number
  points: number
  field_goals_made: number
  field_goals_attempted: number
  three_point_field_goals_made: number
  three_point_field_goals_attempted: number
  two_point_field_goals_made: number
  two_point_field_goals_attempted: number
  free_throws_made: number
  free_throws_attempted: number
  offensive_rebounds: number
  defensive_rebounds: number
  total_rebounds: number
  assists: number
  turnovers: number
  steals: number
  blocks: number
  personal_fouls: number
  field_goal_percentage?: number
  three_point_field_goal_percentage?: number
  two_point_field_goal_percentage?: number
  free_throw_percentage?: number
  performance_index_rating?: number
  efficiency?: number
}

// Action types matching backend
type ActionType =
  | 'three_point_goal_made'
  | 'three_point_goal_missed'
  | 'two_point_goal_made'
  | 'two_point_goal_missed'
  | 'free_throw_made'
  | 'free_throw_missed'
  | 'offensive_rebound'
  | 'defensive_rebound'
  | 'assist'
  | 'turnover'
  | 'steal'
  | 'block'
  | 'personal_foul'

interface ActionButton {
  action: ActionType
  label: string
  icon: React.ReactNode
  color: string
  points?: number
}

function LiveGameContent() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const gameId = searchParams.get('id')

  const [game, setGame] = useState<GameType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away'>('home')
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null)
  const [playerStats, setPlayerStats] = useState<Record<number, PlayerStat>>({})
  const [actionLoading, setActionLoading] = useState(false)
  const [lastAction, setLastAction] = useState<{ action: ActionType; player_id: number } | null>(null)
  const [gameTime, setGameTime] = useState(0) // in seconds
  const [isGameRunning, setIsGameRunning] = useState(false)
  const [quarter, setQuarter] = useState(1)

  // Action buttons configuration
  const actionButtons: ActionButton[] = [
    {
      action: 'three_point_goal_made',
      label: '3PT ✓',
      icon: <Target className="h-4 w-4" />,
      color: 'bg-green-500 hover:bg-green-600',
      points: 3,
    },
    {
      action: 'three_point_goal_missed',
      label: '3PT ✗',
      icon: <XCircle className="h-4 w-4" />,
      color: 'bg-red-500 hover:bg-red-600',
    },
    {
      action: 'two_point_goal_made',
      label: '2PT ✓',
      icon: <CheckCircle className="h-4 w-4" />,
      color: 'bg-green-500 hover:bg-green-600',
      points: 2,
    },
    {
      action: 'two_point_goal_missed',
      label: '2PT ✗',
      icon: <XCircle className="h-4 w-4" />,
      color: 'bg-red-500 hover:bg-red-600',
    },
    {
      action: 'free_throw_made',
      label: 'FT ✓',
      icon: <CheckCircle className="h-4 w-4" />,
      color: 'bg-green-500 hover:bg-green-600',
      points: 1,
    },
    {
      action: 'free_throw_missed',
      label: 'FT ✗',
      icon: <XCircle className="h-4 w-4" />,
      color: 'bg-red-500 hover:bg-red-600',
    },
    {
      action: 'offensive_rebound',
      label: 'REB OFF',
      icon: <Zap className="h-4 w-4" />,
      color: 'bg-orange-500 hover:bg-orange-600',
    },
    {
      action: 'defensive_rebound',
      label: 'REB DEF',
      icon: <Shield className="h-4 w-4" />,
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      action: 'assist',
      label: 'ASSIST',
      icon: <Users className="h-4 w-4" />,
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      action: 'turnover',
      label: 'TURNOVER',
      icon: <RotateCcw className="h-4 w-4" />,
      color: 'bg-red-500 hover:bg-red-600',
    },
    { action: 'steal', label: 'STEAL', icon: <Zap className="h-4 w-4" />, color: 'bg-yellow-500 hover:bg-yellow-600' },
    {
      action: 'block',
      label: 'BLOCK',
      icon: <Shield className="h-4 w-4" />,
      color: 'bg-indigo-500 hover:bg-indigo-600',
    },
    {
      action: 'personal_foul',
      label: 'FOUL',
      icon: <AlertCircle className="h-4 w-4" />,
      color: 'bg-red-500 hover:bg-red-600',
    },
  ]

  const fetchGame = async (id: number) => {
    try {
      setLoading(true)
      setError(null)
      const data = await getGame(id)
      setGame(data)
    } catch (err: unknown) {
      console.error('Errore nel caricamento della partita:', err)
      setError('Impossibile caricare le informazioni della partita')
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

  // Game timer effect
  useEffect(() => {
    let interval: any
    if (isGameRunning) {
      interval = setInterval(() => {
        setGameTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isGameRunning])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const recordAction = async (action: ActionType) => {
    if (!selectedPlayer || !gameId) return

    try {
      setActionLoading(true)

      const result = await recordPlayerAction({
        game_id: parseInt(gameId),
        player_id: selectedPlayer,
        action: action,
      })

      if (result.success) {
        // Update local player stats
        setPlayerStats(prev => ({
          ...prev,
          [selectedPlayer]: result.player_stat,
        }))

        // Set last action for undo functionality
        setLastAction({ action, player_id: selectedPlayer })
      }
    } catch (err) {
      console.error('Error recording action:', err)
      setError("Errore nel registrare l'azione")
    } finally {
      setActionLoading(false)
    }
  }

  const undoLastAction = async () => {
    if (!lastAction || !gameId) return

    try {
      setActionLoading(true)

      const result = await undoPlayerAction({
        game_id: parseInt(gameId),
        player_id: lastAction.player_id,
        action: lastAction.action,
      })

      if (result.success) {
        // Update local player stats
        setPlayerStats(prev => ({
          ...prev,
          [lastAction.player_id]: result.player_stat,
        }))

        // Clear last action
        setLastAction(null)
      }
    } catch (err) {
      console.error('Error undoing action:', err)
      setError("Errore nell'annullare l'azione")
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate(`/game?id=${gameId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alla partita
          </Button>
        </div>
        <LoadingSkeleton type="detail" title="Live Game" />
      </div>
    )
  }

  if (error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={gameId ? () => fetchGame(parseInt(gameId, 10)) : undefined}
        onBack={() => navigate(`/game?id=${gameId}`)}
        title="Live Game"
        type="generic"
      />
    )
  }

  if (!game) {
    return null
  }

  const currentTeam = selectedTeam === 'home' ? game.home_team : game.away_team
  const currentPlayerStat = selectedPlayer ? playerStats[selectedPlayer] : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => navigate(`/game?id=${gameId}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Torna alla partita
        </Button>

        {/* Game Timer */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{formatTime(gameTime)}</div>
            <div className="text-sm text-muted-foreground">Q{quarter}</div>
          </div>
          <Button
            variant={isGameRunning ? 'destructive' : 'default'}
            size="sm"
            onClick={() => setIsGameRunning(!isGameRunning)}
          >
            {isGameRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Game Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            {game.home_team.name} vs {game.away_team.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">
                {Object.values(playerStats)
                  .filter(stat => stat.game_id === game.id)
                  .reduce((total, stat) => total + (stat.points || 0), 0)}
              </div>
              <div className="text-sm font-medium">{game.home_team.abbreviation}</div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="text-3xl font-bold text-red-600">
                {Object.values(playerStats)
                  .filter(stat => stat.game_id === game.id)
                  .reduce((total, stat) => total + (stat.points || 0), 0)}
              </div>
              <div className="text-sm font-medium">{game.away_team.abbreviation}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Seleziona Squadra</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={selectedTeam === 'home' ? 'default' : 'outline'}
              onClick={() => {
                setSelectedTeam('home')
                setSelectedPlayer(null)
              }}
              className="h-16"
            >
              <div className="text-center">
                <div className="font-bold">{game.home_team.name}</div>
                <div className="text-sm opacity-75">Casa</div>
              </div>
            </Button>
            <Button
              variant={selectedTeam === 'away' ? 'default' : 'outline'}
              onClick={() => {
                setSelectedTeam('away')
                setSelectedPlayer(null)
              }}
              className="h-16"
            >
              <div className="text-center">
                <div className="font-bold">{game.away_team.name}</div>
                <div className="text-sm opacity-75">Ospite</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Player Selection */}
      {currentTeam && (
        <Card>
          <CardHeader>
            <CardTitle>Seleziona Giocatore - {currentTeam.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {/* Mock players - replace with actual team players */}
              {Array.from({ length: 12 }, (_, i) => i + 1).map(playerNum => (
                <Button
                  key={playerNum}
                  variant={selectedPlayer === playerNum ? 'default' : 'outline'}
                  onClick={() => setSelectedPlayer(playerNum)}
                  className="h-16"
                >
                  <div className="text-center">
                    <div className="font-bold">#{playerNum}</div>
                    <div className="text-xs">Giocatore {playerNum}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {selectedPlayer && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Azioni - Giocatore #{selectedPlayer}</span>
              {lastAction && (
                <Button variant="outline" size="sm" onClick={undoLastAction} disabled={actionLoading}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Annulla
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {actionButtons.map(button => (
                <Button
                  key={button.action}
                  onClick={() => recordAction(button.action)}
                  disabled={actionLoading}
                  className={`h-16 text-white ${button.color}`}
                >
                  <div className="text-center">
                    {button.icon}
                    <div className="text-xs mt-1">{button.label}</div>
                    {button.points && <div className="text-xs opacity-75">+{button.points}pt</div>}
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Player Stats */}
      {currentPlayerStat && (
        <Card>
          <CardHeader>
            <CardTitle>Statistiche Giocatore #{selectedPlayer}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{currentPlayerStat.points}</div>
                <div className="text-sm text-muted-foreground">Punti</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{currentPlayerStat.total_rebounds}</div>
                <div className="text-sm text-muted-foreground">Rimbalzi</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{currentPlayerStat.assists}</div>
                <div className="text-sm text-muted-foreground">Assist</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{currentPlayerStat.personal_fouls}</div>
                <div className="text-sm text-muted-foreground">Falli</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="font-medium">Tiri dal Campo</div>
                <div>
                  {currentPlayerStat.field_goals_made}/{currentPlayerStat.field_goals_attempted}
                </div>
                {currentPlayerStat.field_goal_percentage && (
                  <div className="text-muted-foreground">{currentPlayerStat.field_goal_percentage}%</div>
                )}
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="font-medium">Tiri da 3</div>
                <div>
                  {currentPlayerStat.three_point_field_goals_made}/{currentPlayerStat.three_point_field_goals_attempted}
                </div>
                {currentPlayerStat.three_point_field_goal_percentage && (
                  <div className="text-muted-foreground">{currentPlayerStat.three_point_field_goal_percentage}%</div>
                )}
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="font-medium">Tiri Liberi</div>
                <div>
                  {currentPlayerStat.free_throws_made}/{currentPlayerStat.free_throws_attempted}
                </div>
                {currentPlayerStat.free_throw_percentage && (
                  <div className="text-muted-foreground">{currentPlayerStat.free_throw_percentage}%</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quarter Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Controlli Partita</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">Quarto:</span>
              {[1, 2, 3, 4].map(q => (
                <Button key={q} variant={quarter === q ? 'default' : 'outline'} size="sm" onClick={() => setQuarter(q)}>
                  Q{q}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setGameTime(0)
                setIsGameRunning(false)
              }}
            >
              <Timer className="h-4 w-4 mr-2" />
              Reset Timer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function LiveGame() {
  return (
    <ErrorBoundary>
      <LiveGameContent />
    </ErrorBoundary>
  )
}

import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Play, Pause, RotateCcw, Users, Trophy, Timer, Loader2, BarChart3 } from 'lucide-react'
import { getGame } from '@/api/gameService'
import { getPlayers } from '@/api/playerService'
import {
  recordAction as recordPlayerAction,
  undoAction as undoPlayerAction,
  getPlayerStats,
} from '@/api/playerStatService'
import { createGameStat, updateGameStat, getGameStats } from '@/api/gameStatService'
import type { CreateGameStatData } from '@/models/gameStat'
import type { Game as GameType } from '@/models/game'
import type { Player } from '@/models/player'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'
import { ErrorDisplay } from '@/components/ErrorDisplay'
import { useToastHelpers } from '@/hooks/useToastHelpers'

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
  icon?: React.ReactNode
  color: string
  points?: number
}

function LiveGameContent() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { showSuccess, showError, showCustom } = useToastHelpers()
  const gameId = searchParams.get('id')

  // Function to convert button color to toast color
  const getToastColorFromButtonColor = (buttonColor: string): string => {
    const colorMap: Record<string, string> = {
      'bg-green-500 hover:bg-green-600': 'bg-green-50 text-green-800 border-l-4 border-green-500',
      'bg-red-500 hover:bg-red-600': 'bg-red-50 text-red-800 border-l-4 border-red-500',
      'bg-orange-500 hover:bg-orange-600': 'bg-orange-50 text-orange-800 border-l-4 border-orange-500',
      'bg-blue-500 hover:bg-blue-600': 'bg-blue-50 text-blue-800 border-l-4 border-blue-500',
      'bg-purple-500 hover:bg-purple-600': 'bg-purple-50 text-purple-800 border-l-4 border-purple-500',
      'bg-yellow-500 hover:bg-yellow-600': 'bg-yellow-50 text-yellow-800 border-l-4 border-yellow-500',
      'bg-indigo-500 hover:bg-indigo-600': 'bg-indigo-50 text-indigo-800 border-l-4 border-indigo-500',
    }
    return colorMap[buttonColor] || 'bg-gray-50 text-gray-800 border-l-4 border-gray-500'
  }

  const [game, setGame] = useState<GameType | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [playersLoading, setPlayersLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away'>('home')
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null)
  const [playerStats, setPlayerStats] = useState<Record<number, PlayerStat>>({} as Record<number, PlayerStat>)
  const [actionLoading, setActionLoading] = useState<Record<ActionType, boolean>>({} as Record<ActionType, boolean>)
  const [undoLoading, setUndoLoading] = useState(false)
  const [lastAction, setLastAction] = useState<{ action: ActionType; player_id: number } | null>(null)
  const [gameTime, setGameTime] = useState(0) // in seconds
  const [isGameRunning, setIsGameRunning] = useState(false)
  const [quarter, setQuarter] = useState(1)
  const [generateStatsLoading, setGenerateStatsLoading] = useState(false)

  // Action buttons configuration
  const actionButtons: ActionButton[] = [
    {
      action: 'three_point_goal_made',
      label: '3PT ✓',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      action: 'three_point_goal_missed',
      label: '3PT ✗',
      color: 'bg-red-500 hover:bg-red-600',
    },
    {
      action: 'two_point_goal_made',
      label: '2PT ✓',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      action: 'two_point_goal_missed',
      label: '2PT ✗',
      color: 'bg-red-500 hover:bg-red-600',
    },
    {
      action: 'free_throw_made',
      label: 'FT ✓',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      action: 'free_throw_missed',
      label: 'FT ✗',
      color: 'bg-red-500 hover:bg-red-600',
    },
    {
      action: 'offensive_rebound',
      label: 'REB OFF',
      color: 'bg-orange-500 hover:bg-orange-600',
    },
    {
      action: 'defensive_rebound',
      label: 'REB DEF',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      action: 'assist',
      label: 'ASSIST',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      action: 'turnover',
      label: 'TURNOVER',
      color: 'bg-red-500 hover:bg-red-600',
    },
    {
      action: 'steal',
      color: 'bg-yellow-500 hover:bg-yellow-600',
      label: 'STEAL',
    },
    {
      action: 'block',
      label: 'BLOCK',
      color: 'bg-indigo-500 hover:bg-indigo-600',
    },
    {
      action: 'personal_foul',
      label: 'FOUL',
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

  const fetchPlayers = async () => {
    try {
      setPlayersLoading(true)
      const data = await getPlayers()
      setPlayers(data)
    } catch (err: unknown) {
      console.error('Errore nel caricamento dei giocatori:', err)
      // Don't set error here as it's not critical for the main functionality
    } finally {
      setPlayersLoading(false)
    }
  }

  const fetchPlayerStats = async (gameId: number) => {
    try {
      const response = await getPlayerStats({ game_id: gameId })
      if (response.success && response.stats) {
        // Convert array of stats to a record keyed by player_id
        const statsRecord: Record<number, PlayerStat> = {}
        response.stats.forEach((stat: PlayerStat) => {
          if (stat.player_id) {
            statsRecord[stat.player_id] = stat
          }
        })
        setPlayerStats(statsRecord)
      }
    } catch (err: unknown) {
      console.error('Errore nel caricamento delle statistiche:', err)
      // Don't set error here as it's not critical for the main functionality
    }
  }

  useEffect(() => {
    if (gameId) {
      const id = parseInt(gameId, 10)
      if (!isNaN(id)) {
        fetchGame(id)
        fetchPlayers()
        fetchPlayerStats(id)
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
    let interval: unknown
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

    const playerName = teamPlayers.find(p => p.id === selectedPlayer)?.name || `Giocatore #${selectedPlayer}`

    try {
      setActionLoading(prev => ({ ...prev, [action]: true }))

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

        // Show success toast with action details and matching color
        const actionButton = actionButtons.find(btn => btn.action === action)
        const actionLabel = actionButton?.label || action
        const toastColor = actionButton ? getToastColorFromButtonColor(actionButton.color) : undefined

        if (toastColor) {
          showCustom(`${actionLabel} registrato per ${playerName}`, toastColor)
        } else {
          showSuccess(`${actionLabel} registrato per ${playerName}`)
        }
      }
    } catch (err) {
      console.error('Error recording action:', err)
      showError(`Errore nel registrare l'azione per ${playerName}`)
      setError("Errore nel registrare l'azione")
    } finally {
      setActionLoading(prev => ({ ...prev, [action]: false }))
    }
  }

  const undoLastAction = async () => {
    if (!lastAction || !gameId) return

    const playerName = players.find(p => p.id === lastAction.player_id)?.name || `Giocatore #${lastAction.player_id}`
    const actionLabel = actionButtons.find(btn => btn.action === lastAction.action)?.label || lastAction.action

    try {
      setUndoLoading(true)

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

        // Show undo toast with matching color (slightly muted for undo)
        const actionButton = actionButtons.find(btn => btn.action === lastAction.action)
        const toastColor = actionButton ? getToastColorFromButtonColor(actionButton.color) : undefined

        if (toastColor) {
          // Use a slightly muted version for undo (replace border with gray but keep background color)
          const undoColor = toastColor.replace(/border-l-4 border-\w+-500/, 'border-l-4 border-gray-400')
          showCustom(`${actionLabel} annullato per ${playerName}`, undoColor)
        } else {
          showCustom(
            `${actionLabel} annullato per ${playerName}`,
            'bg-gray-50 text-gray-800 border-l-4 border-gray-400',
          )
        }
      }
    } catch (err) {
      console.error('Error undoing action:', err)
      showError(`Errore nell'annullare l'azione per ${playerName}`)
      setError("Errore nell'annullare l'azione")
    } finally {
      setUndoLoading(false)
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

  // Get current player stat or create default empty stat
  const getCurrentPlayerStat = () => {
    if (!selectedPlayer) return null

    // Return existing stat or create default empty stat
    return (
      playerStats[selectedPlayer] || {
        id: undefined,
        player_id: selectedPlayer,
        game_id: game?.id || 0,
        points: 0,
        field_goals_made: 0,
        field_goals_attempted: 0,
        three_point_field_goals_made: 0,
        three_point_field_goals_attempted: 0,
        two_point_field_goals_made: 0,
        two_point_field_goals_attempted: 0,
        free_throws_made: 0,
        free_throws_attempted: 0,
        offensive_rebounds: 0,
        defensive_rebounds: 0,
        total_rebounds: 0,
        assists: 0,
        turnovers: 0,
        steals: 0,
        blocks: 0,
        personal_fouls: 0,
        field_goal_percentage: 0,
        three_point_field_goal_percentage: 0,
        two_point_field_goal_percentage: 0,
        free_throw_percentage: 0,
        performance_index_rating: 0,
        efficiency: 0,
      }
    )
  }

  const currentPlayerStat = getCurrentPlayerStat()

  // Get players for the selected team
  const getTeamPlayers = () => {
    if (!currentTeam) return []
    return players.filter(player => player.teams.some(team => team.id === currentTeam.id))
  }

  const teamPlayers = getTeamPlayers()

  // Get players for home team
  const getHomeTeamPlayers = () => {
    if (!game) return []
    return players.filter(player => player.teams.some(team => team.id === game.home_team.id))
  }

  // Get players for away team
  const getAwayTeamPlayers = () => {
    if (!game) return []
    return players.filter(player => player.teams.some(team => team.id === game.away_team.id))
  }

  // Calculate home team total points
  const getHomeTeamPoints = () => {
    const homePlayerIds = getHomeTeamPlayers().map(player => player.id)
    return Object.values(playerStats)
      .filter(stat => stat.game_id === game?.id && homePlayerIds.includes(stat.player_id))
      .reduce((total, stat) => total + (stat.points || 0), 0)
  }

  // Calculate away team total points
  const getAwayTeamPoints = () => {
    const awayPlayerIds = getAwayTeamPlayers().map(player => player.id)
    return Object.values(playerStats)
      .filter(stat => stat.game_id === game?.id && awayPlayerIds.includes(stat.player_id))
      .reduce((total, stat) => total + (stat.points || 0), 0)
  }

  // Calculate comprehensive team statistics
  const calculateTeamStats = (teamId: number) => {
    const teamPlayerIds = players
      .filter(player => player.teams.some(team => team.id === teamId))
      .map(player => player.id)

    const teamPlayerStats = Object.values(playerStats).filter(
      stat => stat.game_id === game?.id && teamPlayerIds.includes(stat.player_id),
    )

    const stats = {
      points: teamPlayerStats.reduce((sum, stat) => sum + (stat.points || 0), 0),
      field_goals_made: teamPlayerStats.reduce((sum, stat) => sum + (stat.field_goals_made || 0), 0),
      field_goals_attempted: teamPlayerStats.reduce((sum, stat) => sum + (stat.field_goals_attempted || 0), 0),
      three_point_field_goals_made: teamPlayerStats.reduce(
        (sum, stat) => sum + (stat.three_point_field_goals_made || 0),
        0,
      ),
      three_point_field_goals_attempted: teamPlayerStats.reduce(
        (sum, stat) => sum + (stat.three_point_field_goals_attempted || 0),
        0,
      ),
      two_point_field_goals_made: teamPlayerStats.reduce(
        (sum, stat) => sum + (stat.two_point_field_goals_made || 0),
        0,
      ),
      two_point_field_goals_attempted: teamPlayerStats.reduce(
        (sum, stat) => sum + (stat.two_point_field_goals_attempted || 0),
        0,
      ),
      free_throws_made: teamPlayerStats.reduce((sum, stat) => sum + (stat.free_throws_made || 0), 0),
      free_throws_attempted: teamPlayerStats.reduce((sum, stat) => sum + (stat.free_throws_attempted || 0), 0),
      offensive_rebounds: teamPlayerStats.reduce((sum, stat) => sum + (stat.offensive_rebounds || 0), 0),
      defensive_rebounds: teamPlayerStats.reduce((sum, stat) => sum + (stat.defensive_rebounds || 0), 0),
      total_rebounds: teamPlayerStats.reduce((sum, stat) => sum + (stat.total_rebounds || 0), 0),
      assists: teamPlayerStats.reduce((sum, stat) => sum + (stat.assists || 0), 0),
      turnovers: teamPlayerStats.reduce((sum, stat) => sum + (stat.turnovers || 0), 0),
      steals: teamPlayerStats.reduce((sum, stat) => sum + (stat.steals || 0), 0),
      blocks: teamPlayerStats.reduce((sum, stat) => sum + (stat.blocks || 0), 0),
      personal_fouls: teamPlayerStats.reduce((sum, stat) => sum + (stat.personal_fouls || 0), 0),
    }

    return stats
  }

  // Generate game statistics for both teams
  const generateGameStats = async () => {
    if (!game || !gameId) return

    try {
      setGenerateStatsLoading(true)

      // Calculate stats for both teams
      const homeTeamStats = calculateTeamStats(game.home_team.id)
      const awayTeamStats = calculateTeamStats(game.away_team.id)

      // Check if game stats already exist
      const existingGameStats = await getGameStats()
      const existingHomeStats = existingGameStats.find(
        stat => stat.game_id === game.id && stat.team_id === game.home_team.id,
      )
      const existingAwayStats = existingGameStats.find(
        stat => stat.game_id === game.id && stat.team_id === game.away_team.id,
      )

      // Create or update home team stats
      const homeStatsData: CreateGameStatData = {
        team_id: game.home_team.id,
        game_id: game.id,
        ...homeTeamStats,
      }

      if (existingHomeStats) {
        await updateGameStat(existingHomeStats.id, homeStatsData)
      } else {
        await createGameStat(homeStatsData)
      }

      // Create or update away team stats
      const awayStatsData: CreateGameStatData = {
        team_id: game.away_team.id,
        game_id: game.id,
        ...awayTeamStats,
      }

      if (existingAwayStats) {
        await updateGameStat(existingAwayStats.id, awayStatsData)
      } else {
        await createGameStat(awayStatsData)
      }

      showSuccess('Statistiche di squadra generate con successo!')
    } catch (error) {
      console.error('Error generating game stats:', error)
      showError('Errore nella generazione delle statistiche di squadra')
    } finally {
      setGenerateStatsLoading(false)
    }
  }

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
              <div className="text-3xl font-bold text-blue-600">{getHomeTeamPoints()}</div>
              <div className="text-sm font-medium">{game.home_team.abbreviation}</div>
              <div className="text-xs text-muted-foreground">Casa</div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="text-3xl font-bold text-red-600">{getAwayTeamPoints()}</div>
              <div className="text-sm font-medium">{game.away_team.abbreviation}</div>
              <div className="text-xs text-muted-foreground">Ospite</div>
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
              {playersLoading ? (
                <div className="col-span-full text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Caricamento giocatori...</p>
                </div>
              ) : teamPlayers.length > 0 ? (
                teamPlayers.map(player => (
                  <Button
                    key={player.id}
                    variant={selectedPlayer === player.id ? 'default' : 'outline'}
                    onClick={() => setSelectedPlayer(player.id)}
                    className="!h-16"
                  >
                    <div className="text-center">
                      <div className="font-bold">#{player.jersey_number || player.id}</div>
                      <div className="text-xs truncate max-w-full">{player.name}</div>
                      {player.position && <div className="text-xs text-muted-foreground">{player.position}</div>}
                    </div>
                  </Button>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">Nessun giocatore trovato per questa squadra</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {selectedPlayer && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                Azioni - {teamPlayers.find(p => p.id === selectedPlayer)?.name || `Giocatore #${selectedPlayer}`}
              </span>
              {lastAction && (
                <Button variant="outline" size="sm" onClick={undoLastAction} disabled={undoLoading}>
                  {undoLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RotateCcw className="h-4 w-4 mr-2" />
                  )}
                  {undoLoading ? 'Annullando...' : 'Annulla'}
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
                  disabled={actionLoading[button.action] || false}
                  className={`h-16 text-white ${button.color} ${actionLoading[button.action] ? 'opacity-75' : ''}`}
                >
                  <div className="text-center">
                    {actionLoading[button.action] ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                      </>
                    ) : (
                      <>
                        {button.icon}
                        <div className="text-xs mt-1">{button.label}</div>
                        {button.points && <div className="text-xs opacity-75">+{button.points}pt</div>}
                      </>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Player Stats */}
      {selectedPlayer && currentPlayerStat && (
        <Card>
          <CardHeader>
            <CardTitle>
              Statistiche - {teamPlayers.find(p => p.id === selectedPlayer)?.name || `Giocatore #${selectedPlayer}`}
            </CardTitle>
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
              <div>
                <div className="text-2xl font-bold">{currentPlayerStat.turnovers}</div>
                <div className="text-sm text-muted-foreground">Palle Perse</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{currentPlayerStat.steals}</div>
                <div className="text-sm text-muted-foreground">Palle Recuperate</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{currentPlayerStat.blocks}</div>
                <div className="text-sm text-muted-foreground">Stoppate</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="font-medium">Tiri dal Campo</div>
                <div>
                  {currentPlayerStat.field_goals_made}/{currentPlayerStat.field_goals_attempted}
                </div>
                <div className="text-muted-foreground">{currentPlayerStat.field_goal_percentage || 0}%</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="font-medium">Tiri da 3</div>
                <div>
                  {currentPlayerStat.three_point_field_goals_made}/{currentPlayerStat.three_point_field_goals_attempted}
                </div>
                <div className="text-muted-foreground">{currentPlayerStat.three_point_field_goal_percentage || 0}%</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="font-medium">Tiri Liberi</div>
                <div>
                  {currentPlayerStat.free_throws_made}/{currentPlayerStat.free_throws_attempted}
                </div>
                <div className="text-muted-foreground">{currentPlayerStat.free_throw_percentage || 0}%</div>
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
            <div className="flex items-center gap-2">
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
              <Button
                variant="default"
                onClick={generateGameStats}
                disabled={generateStatsLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {generateStatsLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <BarChart3 className="h-4 w-4 mr-2" />
                )}
                {generateStatsLoading ? 'Generando...' : 'Genera statistiche'}
              </Button>
            </div>
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

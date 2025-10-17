import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  BarChart3,
  ArrowLeft,
  Calendar,
  Trophy,
  Target,
  TrendingUp,
  HandHeart,
  Users,
  Activity,
  Award,
} from 'lucide-react'
import { getPlayerDetailedStats } from '@/api/playerStatService'
import type { PlayerStatsResponse } from '@/models/playerStat'

export function PlayerStat() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const playerId = searchParams.get('id')

  const [playerStats, setPlayerStats] = useState<PlayerStatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPlayerStats = async (id: number) => {
    try {
      setLoading(true)
      setError(null)
      const data = await getPlayerDetailedStats(id)
      setPlayerStats(data)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const errorResponse = err as { response?: { status?: number } }
        if (errorResponse.response?.status === 403) {
          setError('Non autorizzato. Puoi visualizzare solo le tue statistiche.')
        } else if (errorResponse.response?.status === 404) {
          setError('Giocatore non trovato.')
        } else {
          setError('Impossibile caricare le statistiche del giocatore')
        }
      } else {
        setError('Impossibile caricare le statistiche del giocatore')
      }
      console.error('Errore nel caricamento delle statistiche:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (playerId) {
      const id = parseInt(playerId, 10)
      if (!isNaN(id)) {
        fetchPlayerStats(id)
      } else {
        setError('ID giocatore non valido')
        setLoading(false)
      }
    } else {
      setError('ID giocatore non fornito')
      setLoading(false)
    }
  }, [playerId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatPercentage = (value: number | string | null | undefined) => {
    if (value === null || value === undefined) {
      return '0.0%'
    }

    const numValue = typeof value === 'string' ? parseFloat(value) : value

    if (isNaN(numValue)) {
      return '0.0%'
    }

    return numValue.toFixed(1) + '%'
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => navigate('/players')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna a lista giocatori
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Statistiche Giocatore</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => navigate('/players')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna a lista giocatori
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Statistiche Giocatore</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => playerId && fetchPlayerStats(parseInt(playerId, 10))}>Ricarica</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!playerStats) {
    return null
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => navigate('/players')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Torna a lista giocatori
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer"
          onClick={() => navigate(`/player?id=${playerId}`)}
        >
          <Users className="h-4 w-4 mr-2" />
          Profilo Giocatore
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <BarChart3 className="h-8 w-8" />
          Statistiche - {playerStats.player.name}
        </h1>
        <p className="text-muted-foreground">
          #{playerStats.player.jersey_number} • {playerStats.player.position}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Trophy className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{playerStats.totals.games_played}</p>
                <p className="text-sm text-muted-foreground">Partite Giocate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{playerStats.totals.averages.points.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Punti per Partita</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{playerStats.totals.averages.total_rebounds.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Rimbalzi per Partita</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <HandHeart className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{playerStats.totals.averages.assists.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Assist per Partita</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Statistiche di Tiro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {formatPercentage(playerStats.totals.averages.field_goal_percentage)}
                </div>
                <div className="text-xs text-muted-foreground">% Tiri dal Campo</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {formatPercentage(playerStats.totals.averages.three_point_field_goal_percentage)}
                </div>
                <div className="text-xs text-muted-foreground">% Tiri da 3</div>
              </div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {formatPercentage(playerStats.totals.averages.free_throw_percentage)}
              </div>
              <div className="text-xs text-muted-foreground">% Tiri Liberi</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Altre Statistiche
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{playerStats.totals.averages.steals.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">Palle Rubate/Partita</div>
              </div>
              <div className="text-center p-3 bg-indigo-50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">
                  {playerStats.totals.averages.blocks.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">Stoppate/Partita</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {playerStats.totals.averages.efficiency.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">Efficienza Media</div>
              </div>
              <div className="text-center p-3 bg-cyan-50 rounded-lg">
                <div className="text-2xl font-bold text-cyan-600">{playerStats.totals.totals.total_rebounds}</div>
                <div className="text-xs text-muted-foreground">Rimbalzi Totali</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Statistiche per Partita ({playerStats.stats.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {playerStats.stats.length > 0 ? (
            <div className="space-y-4">
              {playerStats.stats.map(stat => (
                <div key={stat.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">
                        {stat.game?.homeTeam?.name || stat.game?.home_team?.name || 'Team'} vs{' '}
                        {stat.game?.awayTeam?.name || stat.game?.away_team?.name || 'Team'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {stat.game && formatDate(stat.game.date)} •
                        {stat.game &&
                        stat.game.home_team_total_score !== null &&
                        stat.game.away_team_total_score !== null
                          ? ` ${stat.game.home_team_total_score}-${stat.game.away_team_total_score}`
                          : ' In corso'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{stat.points}</div>
                      <div className="text-xs text-muted-foreground">Punti</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-sm">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-medium">{formatTime(stat.seconds_played)}</div>
                      <div className="text-muted-foreground text-xs">MIN</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-medium">{stat.total_rebounds}</div>
                      <div className="text-muted-foreground text-xs">REB</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-medium">{stat.assists}</div>
                      <div className="text-muted-foreground text-xs">AST</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-medium">{stat.steals}</div>
                      <div className="text-muted-foreground text-xs">STL</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-medium">{stat.blocks}</div>
                      <div className="text-muted-foreground text-xs">BLK</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-medium">{stat.turnovers}</div>
                      <div className="text-muted-foreground text-xs">TO</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-medium">{stat.personal_fouls}</div>
                      <div className="text-muted-foreground text-xs">PF</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-3 text-xs">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="font-medium">
                        {stat.field_goals_made}/{stat.field_goals_attempted}
                      </div>
                      <div className="text-muted-foreground">FG ({formatPercentage(stat.field_goal_percentage)})</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="font-medium">
                        {stat.three_point_field_goals_made}/{stat.three_point_field_goals_attempted}
                      </div>
                      <div className="text-muted-foreground">
                        3PT ({formatPercentage(stat.three_point_field_goal_percentage)})
                      </div>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <div className="font-medium">
                        {stat.free_throws_made}/{stat.free_throws_attempted}
                      </div>
                      <div className="text-muted-foreground">FT ({formatPercentage(stat.free_throw_percentage)})</div>
                    </div>
                  </div>

                  <div className="flex justify-center gap-4 mt-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                      <Award className="h-4 w-4" />
                      Efficienza: {stat.efficiency.toFixed(1)}
                    </div>
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                        stat.performance_index_rating >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      <TrendingUp className="h-4 w-4" />
                      PIR: {stat.performance_index_rating}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nessuna statistica disponibile</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

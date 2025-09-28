import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, ArrowLeft, Calendar, Trophy, Hash, Ruler, Target, TrendingUp, HandHeart } from 'lucide-react'
import { getPlayer } from '@/api/playerService'
import type { Player as PlayerType } from '@/models/player'

export function Player() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const playerId = searchParams.get('id')

  const [player, setPlayer] = useState<PlayerType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPlayer = async (id: number) => {
    try {
      setLoading(true)
      setError(null)
      const data = await getPlayer(id)
      setPlayer(data)
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Unauthorized. You can only view your own player information.')
      } else {
        setError('Failed to load player information')
      }
      console.error('Error fetching player:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (playerId) {
      const id = parseInt(playerId, 10)
      if (!isNaN(id)) {
        fetchPlayer(id)
      } else {
        setError('Invalid player ID')
        setLoading(false)
      }
    } else {
      setError('No player ID provided')
      setLoading(false)
    }
  }, [playerId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    return age
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
          <h1 className="text-3xl font-bold tracking-tight">Giocatore</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
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
          <h1 className="text-3xl font-bold tracking-tight">Giocatore</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => playerId && fetchPlayer(parseInt(playerId, 10))}>Ricarica</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!player) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => navigate('/players')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Torna a lista giocatori
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Users className="h-8 w-8" />
          {player.name}
        </h1>
        <p className="text-muted-foreground">
          Player #{player.id} - {player.position}
        </p>
      </div>

      {/* Player Information Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Informazioni
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Numero di maglia</p>
                <p className="text-sm text-muted-foreground">#{player.jersey_number}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Posizione</p>
                <p className="text-sm text-muted-foreground">{player.position}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Ruler className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Altezza</p>
                <p className="text-sm text-muted-foreground">{player.height_cm} cm</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Data di nascita</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(player.birth_date)} ({calculateAge(player.birth_date)} anni)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Statistiche
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Target className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600">{player.points_per_game}</div>
                <div className="text-xs text-muted-foreground">Punti a partita</div>
              </div>

              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600">{player.rebounds_per_game}</div>
                <div className="text-xs text-muted-foreground">Rimbalzi a partita</div>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <HandHeart className="h-4 w-4 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-600">{player.assists_per_game}</div>
                <div className="text-xs text-muted-foreground">Assist a partita</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teams */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Squadre ({player.teams.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {player.teams.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {player.teams.map(team => (
                  <div key={team.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{team.name}</h3>
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">{team.abbreviation}</span>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>
                        <strong>Società:</strong> {team.club.name}
                      </p>
                      <p>
                        <strong>Categoria:</strong> {team.league.name}
                      </p>
                      <p>
                        <strong>Team ID:</strong> #{team.id}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nessuna squadra</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium">Player ID</p>
              <p className="text-sm text-muted-foreground">#{player.id}</p>
            </div>

            <div>
              <p className="text-sm font-medium">Created</p>
              <p className="text-sm text-muted-foreground">{formatDate(player.created_at)}</p>
            </div>

            <div>
              <p className="text-sm font-medium">Last Updated</p>
              <p className="text-sm text-muted-foreground">{formatDate(player.updated_at)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="outline">Edit Player</Button>
            <Button variant="outline">View Statistics</Button>
            <Button variant="outline">Manage Teams</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, ArrowLeft, Calendar, Trophy, Building, Users, Ruler } from 'lucide-react'
import { getTeam } from '@/api/teamService'
import type { Team as TeamType } from '@/models/team'

export function Team() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const teamId = searchParams.get('id')

  const [team, setTeam] = useState<TeamType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTeam = async (id: number) => {
    try {
      setLoading(true)
      setError(null)
      const data = await getTeam(id)
      setTeam(data)
    } catch (err: any) {
      if (err.response?.status === 403) {
        if (err.response.data?.message?.includes('not associated with any player')) {
          setError('Unauthorized. User is not associated with any player.')
        } else {
          setError('Unauthorized. You can only view teams you belong to.')
        }
      } else {
        setError('Failed to load team information')
      }
      console.error('Error fetching team:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (teamId) {
      const id = parseInt(teamId, 10)
      if (!isNaN(id)) {
        fetchTeam(id)
      } else {
        setError('Invalid team ID')
        setLoading(false)
      }
    } else {
      setError('No team ID provided')
      setLoading(false)
    }
  }, [teamId])

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
          <Button variant="outline" size="sm" onClick={() => navigate('/teams')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna a lista squadre
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Squadra</h1>
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
          <Button variant="outline" size="sm" onClick={() => navigate('/teams')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna a lista squadre
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Squadra</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => teamId && fetchTeam(parseInt(teamId, 10))}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!team) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/teams')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Torna a lista squadre
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Shield className="h-8 w-8" />
          {team.name}
        </h1>
        <p className="text-muted-foreground">
          Team #{team.id} - {team.abbreviation}
        </p>
      </div>

      {/* Team Information Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Informazioni
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Sigla</p>
                <p className="text-sm text-muted-foreground">{team.abbreviation}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Building className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Società</p>
                <p className="text-sm text-muted-foreground">{team.club.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Categoria</p>
                <p className="text-sm text-muted-foreground">{team.league.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Creata</p>
                <p className="text-sm text-muted-foreground">{formatDate(team.created_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Statistiche
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{team.players?.length || 0}</div>
                <div className="text-xs text-muted-foreground">Giocatori</div>
              </div>

              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {team.players?.reduce((sum, player) => sum + parseFloat(player.points_per_game), 0).toFixed(1) ||
                    '0.0'}
                </div>
                <div className="text-xs text-muted-foreground">Media PPG</div>
              </div>

              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {team.players?.reduce((sum, player) => sum + parseFloat(player.rebounds_per_game), 0).toFixed(1) ||
                    '0.0'}
                </div>
                <div className="text-xs text-muted-foreground">Media RPG</div>
              </div>

              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {team.players?.reduce((sum, player) => sum + parseFloat(player.assists_per_game), 0).toFixed(1) ||
                    '0.0'}
                </div>
                <div className="text-xs text-muted-foreground">Media APG</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Players Roster */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Giocatori ({team.players?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {team.players && team.players.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {team.players.map(player => (
                <div key={player.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{player.name}</h3>
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">#{player.jersey_number}</span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{player.position}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Ruler className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{player.height_cm} cm</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{calculateAge(player.birth_date)} anni</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="font-medium">{player.points_per_game}</div>
                      <div className="text-muted-foreground">PPG</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="font-medium">{player.rebounds_per_game}</div>
                      <div className="text-muted-foreground">RPG</div>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <div className="font-medium">{player.assists_per_game}</div>
                      <div className="text-muted-foreground">APG</div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full cursor-pointer"
                      onClick={() => (window.location.href = `/admin/player?id=${player.id}`)}
                    >
                      Vedi
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No players in this team</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Informazioni
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm font-medium">Team ID</p>
            <p className="text-sm text-muted-foreground">#{team.id}</p>
          </div>

          <div>
            <p className="text-sm font-medium">Created</p>
            <p className="text-sm text-muted-foreground">{formatDate(team.created_at)}</p>
          </div>

          <div>
            <p className="text-sm font-medium">Last Updated</p>
            <p className="text-sm text-muted-foreground">{formatDate(team.updated_at)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="outline">Edit Team</Button>
            <Button variant="outline">Manage Players</Button>
            <Button variant="outline">View Statistics</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

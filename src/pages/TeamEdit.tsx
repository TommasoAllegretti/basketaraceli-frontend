import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield, ArrowLeft, Save, Building, Trophy, AlertCircle } from 'lucide-react'
import { getTeam, updateTeam, type UpdateTeamData } from '@/api/teamService'
import { getLeagues } from '@/api/leagueService'
import { getClubs } from '@/api/clubService'
import { useAuth } from '@/contexts/AuthContext'
import type { League } from '@/models/league'
import type { Club } from '@/models/club'
import type { Team } from '@/models/team'

export function TeamEdit() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const teamId = searchParams.get('id')
  const { isAdmin, loading: authLoading } = useAuth()

  const [team, setTeam] = useState<Team | null>(null)
  const [formData, setFormData] = useState<UpdateTeamData>({
    abbreviation: '',
    league_id: undefined,
    club_id: undefined,
  })

  const [leagues, setLeagues] = useState<League[]>([])
  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!teamId) {
        setError('ID squadra non fornito')
        setDataLoading(false)
        return
      }

      const id = parseInt(teamId, 10)
      if (isNaN(id)) {
        setError('ID squadra non valido')
        setDataLoading(false)
        return
      }

      try {
        setDataLoading(true)
        const [teamData, leaguesData, clubsData] = await Promise.all([getTeam(id), getLeagues(), getClubs()])

        setTeam(teamData)
        setLeagues(leaguesData)
        setClubs(clubsData)

        // Popola il form con i dati esistenti
        setFormData({
          abbreviation: teamData.abbreviation,
          league_id: teamData.league?.id,
          club_id: teamData.club?.id,
        })
      } catch (err: any) {
        console.error('Errore nel recupero dei dati:', err)
        if (err.response?.status === 403) {
          setError('Non autorizzato. Non hai i permessi per modificare questa squadra.')
        } else if (err.response?.status === 404) {
          setError('Squadra non trovata.')
        } else {
          setError('Impossibile caricare i dati della squadra')
        }
      } finally {
        setDataLoading(false)
      }
    }

    fetchData()
  }, [teamId])

  const handleInputChange = (field: keyof UpdateTeamData, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
    // Pulisci i messaggi quando l'utente inizia a digitare
    if (error) setError(null)
    if (success) setSuccess(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!teamId) {
      setError('ID squadra mancante')
      return
    }

    if (!formData.abbreviation.trim()) {
      setError("L'abbreviazione della squadra è obbligatoria")
      return
    }

    if (!formData.league_id) {
      setError('Il campionato è obbligatorio')
      return
    }

    if (!formData.club_id) {
      setError('La società è obbligatoria')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const response = await updateTeam(parseInt(teamId, 10), {
        abbreviation: formData.abbreviation.trim(),
        league_id: formData.league_id,
        club_id: formData.club_id,
      })

      setSuccess(response.message || 'Squadra aggiornata con successo')

      // Reindirizza alla pagina della squadra dopo un breve ritardo
      setTimeout(() => {
        navigate(`/team?id=${teamId}`)
      }, 2000)
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Non autorizzato. Solo gli amministratori possono modificare squadre.')
      } else if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('Impossibile aggiornare la squadra. Riprova.')
      }
      console.error("Errore nell'aggiornamento della squadra:", err)
    } finally {
      setLoading(false)
    }
  }

  if (dataLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/teams')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alle Squadre
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifica Squadra</h1>
          <p className="text-muted-foreground">Caricamento dati squadra...</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show loading while auth context is loading
  if (authLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/teams')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alle Squadre
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifica Squadra</h1>
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show unauthorized only after auth is loaded and user is confirmed not admin
  if (!authLoading && !isAdmin) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/teams')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alle Squadre
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifica Squadra</h1>
          <p className="text-muted-foreground">Modifica una squadra esistente</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">Accesso Non Autorizzato</p>
              <p className="text-muted-foreground mb-4">Solo gli amministratori possono modificare squadre.</p>
              <Button onClick={() => navigate('/teams')}>Torna alle Squadre</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !team) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/teams')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alle Squadre
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifica Squadra</h1>
          <p className="text-muted-foreground">Modifica una squadra esistente</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => navigate('/teams')}>Torna alle Squadre</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Intestazione */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/teams')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Torna alle Squadre
        </Button>
        {team && (
          <Button variant="outline" size="sm" onClick={() => navigate(`/team?id=${team.id}`)}>
            Visualizza Squadra
          </Button>
        )}
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Save className="h-8 w-8" />
          Modifica Squadra
        </h1>
        <p className="text-muted-foreground">{team ? `Modifica ${team.name}` : 'Modifica una squadra esistente'}</p>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Informazioni Squadra
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Abbreviazione */}
              <div className="space-y-2">
                <Label htmlFor="abbreviation">
                  Abbreviazione Squadra <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="abbreviation"
                  type="text"
                  placeholder="es. LAL, MIA, BOS"
                  value={formData.abbreviation}
                  onChange={e => handleInputChange('abbreviation', e.target.value)}
                  maxLength={10}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Abbreviazione breve per la squadra (massimo 10 caratteri)
                </p>
              </div>

              {/* Campionato */}
              <div className="space-y-2">
                <Label htmlFor="league">
                  <Trophy className="h-4 w-4 inline mr-1" />
                  Campionato <span className="text-red-500">*</span>
                </Label>
                <select
                  id="league"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.league_id || ''}
                  onChange={e => handleInputChange('league_id', e.target.value ? parseInt(e.target.value) : undefined)}
                >
                  <option value="">Seleziona un campionato</option>
                  {leagues.map(league => (
                    <option key={league.id} value={league.id}>
                      {league.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Società */}
              <div className="space-y-2">
                <Label htmlFor="club">
                  <Building className="h-4 w-4 inline mr-1" />
                  Società <span className="text-red-500">*</span>
                </Label>
                <select
                  id="club"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.club_id || ''}
                  onChange={e => handleInputChange('club_id', e.target.value ? parseInt(e.target.value) : undefined)}
                >
                  <option value="">Seleziona una società</option>
                  {clubs.map(club => (
                    <option key={club.id} value={club.id}>
                      {club.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Messaggio di Errore */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Messaggio di Successo */}
              {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-600 text-sm">{success}</p>
                  <p className="text-green-600 text-xs mt-1">Reindirizzamento alla pagina squadra...</p>
                </div>
              )}

              {/* Pulsanti */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={loading || !formData.abbreviation.trim() || !formData.league_id || !formData.club_id}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Aggiornamento Squadra...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Aggiorna Squadra
                    </>
                  )}
                </Button>

                <Button type="button" variant="outline" onClick={() => navigate('/teams')} disabled={loading}>
                  Annulla
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Card di Aiuto */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Aiuto</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Abbreviazione:</strong> Un codice breve per identificare la squadra (es. "LAL" per Los Angeles
              Lakers)
            </p>
            <p>
              <strong>Campionato:</strong> Il campionato in cui compete questa squadra (obbligatorio)
            </p>
            <p>
              <strong>Società:</strong> La società a cui appartiene questa squadra (obbligatorio)
            </p>
            <p>
              <strong>Requisiti:</strong> Tutti i campi sono obbligatori per modificare una squadra
            </p>
            <p>
              <strong>Nota:</strong> Solo gli amministratori possono modificare squadre
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

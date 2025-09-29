import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield, ArrowLeft, Plus, Building, Trophy, AlertCircle } from 'lucide-react'
import { createTeam, type CreateTeamData } from '@/api/teamService'
import { getLeagues } from '@/api/leagueService'
import { getClubs } from '@/api/clubService'
import { useAuth } from '@/contexts/AuthContext'
import type { League } from '@/models/league'
import type { Club } from '@/models/club'

export function TeamCreate() {
  const navigate = useNavigate()
  const { isAdmin, loading: authLoading } = useAuth()

  const [formData, setFormData] = useState<CreateTeamData>({
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
      try {
        setDataLoading(true)
        const [leaguesData, clubsData] = await Promise.all([getLeagues(), getClubs()])
        setLeagues(leaguesData)
        setClubs(clubsData)
      } catch (err) {
        console.error('Errore nel recupero dei dati:', err)
        setError('Impossibile caricare campionati e società')
      } finally {
        setDataLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleInputChange = (field: keyof CreateTeamData, value: string | number | undefined) => {
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

    if (!formData.abbreviation.trim()) {
      setError("L'abbreviazione della squadra è obbligatoria")
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const response = await createTeam({
        abbreviation: formData.abbreviation.trim(),
        league_id: formData.league_id || undefined,
        club_id: formData.club_id || undefined,
      })

      setSuccess(response.message || 'Squadra creata con successo')

      // Reset form
      setFormData({
        abbreviation: '',
        league_id: undefined,
        club_id: undefined,
      })

      // Reindirizza alla lista squadre dopo un breve ritardo
      setTimeout(() => {
        navigate('/teams')
      }, 2000)
    } catch (err: unknown) {
      if (err.response?.status === 403) {
        setError('Non autorizzato. Solo gli amministratori possono creare squadre.')
      } else if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('Impossibile creare la squadra. Riprova.')
      }
      console.error('Errore nella creazione della squadra:', err)
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
          <h1 className="text-3xl font-bold tracking-tight">Crea Nuova Squadra</h1>
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
          <h1 className="text-3xl font-bold tracking-tight">Crea Nuova Squadra</h1>
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
          <h1 className="text-3xl font-bold tracking-tight">Crea Nuova Squadra</h1>
          <p className="text-muted-foreground">Aggiungi una nuova squadra al sistema</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">Accesso Non Autorizzato</p>
              <p className="text-muted-foreground mb-4">Solo gli amministratori possono creare squadre.</p>
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
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">Crea Nuova Squadra</h1>
        <p className="text-muted-foreground">Aggiungi una nuova squadra al sistema</p>
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
                  Campionato (Opzionale)
                </Label>
                <select
                  id="league"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.league_id || ''}
                  onChange={e => handleInputChange('league_id', e.target.value ? parseInt(e.target.value) : undefined)}
                >
                  <option value="">Seleziona un campionato (opzionale)</option>
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
                  Società (Opzionale)
                </Label>
                <select
                  id="club"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.club_id || ''}
                  onChange={e => handleInputChange('club_id', e.target.value ? parseInt(e.target.value) : undefined)}
                >
                  <option value="">Seleziona una società (opzionale)</option>
                  {clubs.map(club => (
                    <option key={club.id} value={club.id}>
                      {club.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Messaggio di Successo */}
              {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-600 text-sm">{success}</p>
                  <p className="text-green-600 text-xs mt-1">Reindirizzamento alla lista squadre...</p>
                </div>
              )}

              {/* Pulsante Invio */}
              <div className="flex gap-4">
                <Button type="submit" disabled={loading || !formData.abbreviation.trim()} className="flex-1">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creazione Squadra...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Crea Squadra
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
              <strong>Campionato:</strong> Il campionato in cui compete questa squadra (opzionale)
            </p>
            <p>
              <strong>Società:</strong> La società a cui appartiene questa squadra (opzionale)
            </p>
            <p>
              <strong>Nota:</strong> Solo gli amministratori possono creare squadre
            </p>
          </CardContent>
        </Card>

        {/* Card Esempi */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Esempi di Abbreviazioni Squadra</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 text-sm">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="font-medium">LAL</p>
                <p className="text-muted-foreground text-xs">Los Angeles Lakers</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="font-medium">MIA</p>
                <p className="text-muted-foreground text-xs">Miami Heat</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="font-medium">BOS</p>
                <p className="text-muted-foreground text-xs">Boston Celtics</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

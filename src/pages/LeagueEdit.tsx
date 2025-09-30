import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trophy, ArrowLeft, Save, AlertCircle } from 'lucide-react'
import { getLeague, updateLeague, type UpdateLeagueData } from '@/api/leagueService'
import { useAuth } from '@/contexts/AuthContext'
import type { League } from '@/models/league'

export function LeagueEdit() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const leagueId = searchParams.get('id')
  const { isAdmin, loading: authLoading } = useAuth()

  const [league, setLeague] = useState<League | null>(null)
  const [formData, setFormData] = useState<UpdateLeagueData>({
    name: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!leagueId) {
        setError('ID campionato non fornito')
        setDataLoading(false)
        return
      }

      const id = parseInt(leagueId, 10)
      if (isNaN(id)) {
        setError('ID campionato non valido')
        setDataLoading(false)
        return
      }

      try {
        setDataLoading(true)
        const leagueData = await getLeague(id)

        setLeague(leagueData)

        // Popola il form con i dati esistenti
        setFormData({
          name: leagueData.name,
        })
      } catch (err: any) {
        console.error('Errore nel recupero dei dati:', err)
        if (err.response?.status === 403) {
          setError('Non autorizzato. Non hai i permessi per modificare questa campionato.')
        } else if (err.response?.status === 404) {
          setError('Campionato non trovata.')
        } else {
          setError('Impossibile caricare i dati della campionato')
        }
      } finally {
        setDataLoading(false)
      }
    }

    fetchData()
  }, [leagueId])

  const handleInputChange = (field: keyof UpdateLeagueData, value: string) => {
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

    if (!leagueId) {
      setError('ID campionato mancante')
      return
    }

    if (!formData.name.trim()) {
      setError('Il nome della campionato è obbligatorio')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const response = await updateLeague(parseInt(leagueId, 10), {
        name: formData.name.trim(),
      })

      setSuccess(response.message || 'Campionato aggiornata con successo')

      // Reindirizza alla pagina della campionato dopo un breve ritardo
      setTimeout(() => {
        navigate(`/league?id=${leagueId}`)
      }, 2000)
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Non autorizzato. Solo gli amministratori possono modificare leghe.')
      } else if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('Impossibile aggiornare la campionato. Riprova.')
      }
      console.error("Errore nell'aggiornamento della campionato:", err)
    } finally {
      setLoading(false)
    }
  }

  if (dataLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/leagues')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alle Leghe
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifica Campionato</h1>
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
          <Button variant="outline" size="sm" onClick={() => navigate('/leagues')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alle Leghe
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifica Campionato</h1>
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
          <Button variant="outline" size="sm" onClick={() => navigate('/leagues')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alle Leghe
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifica Campionato</h1>
          <p className="text-muted-foreground">Modifica una campionato esistente</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">Accesso Non Autorizzato</p>
              <p className="text-muted-foreground mb-4">Solo gli amministratori possono modificare leghe.</p>
              <Button onClick={() => navigate('/leagues')}>Torna alle Leghe</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !league) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/leagues')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alle Leghe
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifica Campionato</h1>
          <p className="text-muted-foreground">Modifica una campionato esistente</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => navigate('/leagues')}>Torna alle Leghe</Button>
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
        <Button variant="outline" size="sm" onClick={() => navigate('/leagues')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Torna alle Leghe
        </Button>
        {league && (
          <Button variant="outline" size="sm" onClick={() => navigate(`/league?id=${league.id}`)}>
            Visualizza Campionato
          </Button>
        )}
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Save className="h-8 w-8" />
          Modifica Campionato
        </h1>
        <p className="text-muted-foreground">
          {league ? `Modifica ${league.name}` : 'Modifica una campionato esistente'}
        </p>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Informazioni Campionato
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nome Campionato <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="es. Serie A, Premier League, NBA"
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  maxLength={100}
                  required
                />
                <p className="text-sm text-muted-foreground">Nome completo della campionato (massimo 100 caratteri)</p>
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
                  <p className="text-green-600 text-xs mt-1">Reindirizzamento alla pagina campionato...</p>
                </div>
              )}

              {/* Pulsanti */}
              <div className="flex gap-4">
                <Button type="submit" disabled={loading || !formData.name.trim()} className="flex-1">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Aggiornamento Campionato...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Aggiorna Campionato
                    </>
                  )}
                </Button>

                <Button type="button" variant="outline" onClick={() => navigate('/leagues')} disabled={loading}>
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
              <strong>Nome:</strong> Il nome completo della campionato (es. "U15", "Serie D", "UISP")
            </p>
            <p>
              <strong>Requisiti:</strong> Il nome è obbligatorio e deve essere univoco nel sistema
            </p>
            <p>
              <strong>Lunghezza:</strong> Minimo 1 carattere, massimo 100 caratteri
            </p>
            <p>
              <strong>Suggerimenti:</strong> Usa nomi chiari e riconoscibili, evita abbreviazioni poco chiare
            </p>
            <p>
              <strong>Nota:</strong> Solo gli amministratori possono modificare leghe
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

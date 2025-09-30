import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Building, ArrowLeft, Save, AlertCircle } from 'lucide-react'
import { getClub, updateClub, type UpdateClubData } from '@/api/clubService'
import { useAuth } from '@/contexts/AuthContext'
import type { Club } from '@/models/club'

export function ClubEdit() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const clubId = searchParams.get('id')
  const { isAdmin, loading: authLoading } = useAuth()

  const [club, setClub] = useState<Club | null>(null)
  const [formData, setFormData] = useState<UpdateClubData>({
    name: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    const fetchClub = async () => {
      if (!clubId) {
        setError('ID società non fornito')
        setDataLoading(false)
        return
      }

      const id = parseInt(clubId, 10)
      if (isNaN(id)) {
        setError('ID società non valido')
        setDataLoading(false)
        return
      }

      try {
        setDataLoading(true)
        const clubData = await getClub(id)
        setClub(clubData)

        // Popola il form con i dati esistenti
        setFormData({
          name: clubData.name,
        })
      } catch (err: any) {
        console.error('Errore nel recupero della società:', err)
        if (err.response?.status === 403) {
          setError('Non autorizzato. Non hai i permessi per modificare questa società.')
        } else if (err.response?.status === 404) {
          setError('Società non trovata.')
        } else {
          setError('Impossibile caricare i dati della società')
        }
      } finally {
        setDataLoading(false)
      }
    }

    fetchClub()
  }, [clubId])

  const handleInputChange = (field: keyof UpdateClubData, value: string) => {
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

    if (!clubId) {
      setError('ID società mancante')
      return
    }

    if (!formData.name.trim()) {
      setError('Il nome della società è obbligatorio')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const response = await updateClub(parseInt(clubId, 10), {
        name: formData.name.trim(),
      })

      setSuccess(response.message || 'Società aggiornata con successo')

      // Reindirizza alla pagina della società dopo un breve ritardo
      setTimeout(() => {
        navigate(`/club?id=${clubId}`)
      }, 2000)
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Non autorizzato. Solo gli amministratori possono modificare società.')
      } else if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('Impossibile aggiornare la società. Riprova.')
      }
      console.error("Errore nell'aggiornamento della società:", err)
    } finally {
      setLoading(false)
    }
  }

  if (dataLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/clubs')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alle Società
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifica Società</h1>
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

  // Show loading while auth context is loading
  if (authLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/clubs')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alle Società
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifica Società</h1>
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
          <Button variant="outline" size="sm" onClick={() => navigate('/clubs')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alle Società
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifica Società</h1>
          <p className="text-muted-foreground">Modifica una società esistente</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">Accesso Non Autorizzato</p>
              <p className="text-muted-foreground mb-4">Solo gli amministratori possono modificare società.</p>
              <Button onClick={() => navigate('/clubs')}>Torna alle Società</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !club) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/clubs')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alle Società
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifica Società</h1>
          <p className="text-muted-foreground">Modifica una società esistente</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => navigate('/clubs')}>Torna alle Società</Button>
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
        <Button variant="outline" size="sm" onClick={() => navigate('/clubs')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Torna alle Società
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Save className="h-8 w-8" />
          Modifica Società
        </h1>
        <p className="text-muted-foreground">{club ? `Modifica ${club.name}` : 'Modifica una società esistente'}</p>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Informazioni Società
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome Società */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nome Società <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="es. Pallacanestro Milano, Basketball Club Roma"
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  maxLength={100}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Inserisci il nome completo della società (massimo 100 caratteri)
                </p>
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
                  <p className="text-green-600 text-xs mt-1">Reindirizzamento alla pagina società...</p>
                </div>
              )}

              {/* Pulsanti */}
              <div className="flex gap-4">
                <Button type="submit" disabled={loading || !formData.name.trim()} className="flex-1">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Aggiornamento Società...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Aggiorna Società
                    </>
                  )}
                </Button>

                <Button type="button" variant="outline" onClick={() => navigate('/clubs')} disabled={loading}>
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
              <strong>Nome Società:</strong> Il nome completo e ufficiale della società sportiva
            </p>
            <p>
              <strong>Requisiti:</strong> Il nome deve essere univoco e non può essere vuoto
            </p>
            <p>
              <strong>Lunghezza:</strong> Massimo 100 caratteri
            </p>
            <p>
              <strong>Nota:</strong> Solo gli amministratori possono modificare società
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

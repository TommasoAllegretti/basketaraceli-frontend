import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Building, ArrowLeft, Plus, AlertCircle } from 'lucide-react'
import { createClub, type CreateClubData } from '@/api/clubService'
import { useAuth } from '@/contexts/AuthContext'

export function ClubCreate() {
  const navigate = useNavigate()
  const { isAdmin, loading: authLoading } = useAuth()

  const [formData, setFormData] = useState<CreateClubData>({
    name: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleInputChange = (field: keyof CreateClubData, value: string) => {
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

    if (!formData.name.trim()) {
      setError('Il nome della società è obbligatorio')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const response = await createClub({
        name: formData.name.trim(),
      })

      setSuccess(response.message || 'Società creata con successo')

      // Reset form
      setFormData({
        name: '',
      })

      // Reindirizza alla lista società dopo un breve ritardo
      setTimeout(() => {
        navigate('/clubs')
      }, 2000)
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Non autorizzato. Solo gli amministratori possono creare società.')
      } else if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('Impossibile creare la società. Riprova.')
      }
      console.error('Errore nella creazione della società:', err)
    } finally {
      setLoading(false)
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Crea Nuova Società</h1>
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
          <h1 className="text-3xl font-bold tracking-tight">Crea Nuova Società</h1>
          <p className="text-muted-foreground">Aggiungi una nuova società al sistema</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">Accesso Non Autorizzato</p>
              <p className="text-muted-foreground mb-4">Solo gli amministratori possono creare società.</p>
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
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">Crea Nuova Società</h1>
        <p className="text-muted-foreground">Aggiungi una nuova società al sistema</p>
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
                  <p className="text-green-600 text-xs mt-1">Reindirizzamento alla lista società...</p>
                </div>
              )}

              {/* Pulsante Invio */}
              <div className="flex gap-4">
                <Button type="submit" disabled={loading || !formData.name.trim()} className="flex-1">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creazione Società...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Crea Società
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
              <strong>Nota:</strong> Solo gli amministratori possono creare società
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

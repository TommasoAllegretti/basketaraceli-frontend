import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, ArrowLeft, Plus, AlertCircle, Calendar, Ruler, Hash } from 'lucide-react'
import { createPlayer, type CreatePlayerData } from '@/api/playerService'
import { useAuth } from '@/contexts/AuthContext'

export function PlayerCreate() {
  const navigate = useNavigate()
  const { isAdmin, loading: authLoading } = useAuth()

  const [formData, setFormData] = useState<CreatePlayerData>({
    name: '',
    position: '',
    height_cm: 0,
    birth_date: '',
    jersey_number: 0,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleInputChange = (field: keyof CreatePlayerData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
    // Pulisci i messaggi quando l'utente inizia a digitare
    if (error) setError(null)
    if (success) setSuccess(null)
  }

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return 'Il nome del giocatore è obbligatorio'
    }
    if (!formData.position.trim()) {
      return 'La posizione è obbligatoria'
    }
    if (!formData.birth_date) {
      return 'La data di nascita è obbligatoria'
    }
    if (formData.height_cm <= 0 || formData.height_cm > 300) {
      return "L'altezza deve essere compresa tra 1 e 300 cm"
    }
    if (formData.jersey_number <= 0 || formData.jersey_number > 99) {
      return 'Il numero di maglia deve essere compreso tra 1 e 99'
    }

    // Validate birth date is not in the future
    const birthDate = new Date(formData.birth_date)
    const today = new Date()
    if (birthDate > today) {
      return 'La data di nascita non può essere nel futuro'
    }

    // Validate minimum age (e.g., 10 years old)
    const minAge = new Date()
    minAge.setFullYear(today.getFullYear() - 10)
    if (birthDate > minAge) {
      return 'Il giocatore deve avere almeno 10 anni'
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const response = await createPlayer({
        name: formData.name.trim(),
        position: formData.position.trim(),
        height_cm: formData.height_cm,
        birth_date: formData.birth_date,
        jersey_number: formData.jersey_number,
      })

      setSuccess(response.message || 'Giocatore creato con successo')

      // Reset form
      setFormData({
        name: '',
        position: '',
        height_cm: 0,
        birth_date: '',
        jersey_number: 0,
      })

      // Reindirizza alla lista giocatori dopo un breve ritardo
      setTimeout(() => {
        navigate('/players')
      }, 2000)
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Non autorizzato. Solo gli amministratori possono creare giocatori.')
      } else if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('Impossibile creare il giocatore. Riprova.')
      }
      console.error('Errore nella creazione del giocatore:', err)
    } finally {
      setLoading(false)
    }
  }

  // Show loading while auth context is loading
  if (authLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/players')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna ai Giocatori
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crea Nuovo Giocatore</h1>
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
          <Button variant="outline" size="sm" onClick={() => navigate('/players')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna ai Giocatori
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crea Nuovo Giocatore</h1>
          <p className="text-muted-foreground">Aggiungi un nuovo giocatore al sistema</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">Accesso Non Autorizzato</p>
              <p className="text-muted-foreground mb-4">Solo gli amministratori possono creare giocatori.</p>
              <Button onClick={() => navigate('/players')}>Torna ai Giocatori</Button>
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
        <Button variant="outline" size="sm" onClick={() => navigate('/players')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Torna ai Giocatori
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">Crea Nuovo Giocatore</h1>
        <p className="text-muted-foreground">Aggiungi un nuovo giocatore al sistema</p>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informazioni Giocatore
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome Giocatore */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  <User className="h-4 w-4 inline mr-1" />
                  Nome Completo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="es. Marco Rossi, Luca Bianchi"
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  maxLength={100}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Inserisci il nome completo del giocatore (massimo 100 caratteri)
                </p>
              </div>

              {/* Posizione */}
              <div className="space-y-2">
                <Label htmlFor="position">
                  Posizione <span className="text-red-500">*</span>
                </Label>
                <select
                  id="position"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.position}
                  onChange={e => handleInputChange('position', e.target.value)}
                  required
                >
                  <option value="">Seleziona una posizione</option>
                  <option value="Playmaker">Playmaker (PG)</option>
                  <option value="Guardia">Guardia (SG)</option>
                  <option value="Ala piccola">Ala piccola (SF)</option>
                  <option value="Ala grande">Ala grande (PF)</option>
                  <option value="Centro">Centro (C)</option>
                </select>
                <p className="text-sm text-muted-foreground">Seleziona la posizione principale del giocatore</p>
              </div>

              {/* Altezza */}
              <div className="space-y-2">
                <Label htmlFor="height">
                  <Ruler className="h-4 w-4 inline mr-1" />
                  Altezza (cm) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="es. 185, 200"
                  value={formData.height_cm || ''}
                  onChange={e => handleInputChange('height_cm', parseInt(e.target.value) || 0)}
                  min="100"
                  max="300"
                  required
                />
                <p className="text-sm text-muted-foreground">Altezza del giocatore in centimetri (100-300 cm)</p>
              </div>

              {/* Data di Nascita */}
              <div className="space-y-2">
                <Label htmlFor="birth_date">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Data di Nascita <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={e => handleInputChange('birth_date', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Data di nascita del giocatore (deve avere almeno 10 anni)
                </p>
              </div>

              {/* Numero di Maglia */}
              <div className="space-y-2">
                <Label htmlFor="jersey_number">
                  <Hash className="h-4 w-4 inline mr-1" />
                  Numero di Maglia <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="jersey_number"
                  type="number"
                  placeholder="es. 23, 10, 7"
                  value={formData.jersey_number || ''}
                  onChange={e => handleInputChange('jersey_number', parseInt(e.target.value) || 0)}
                  min="1"
                  max="99"
                  required
                />
                <p className="text-sm text-muted-foreground">Numero di maglia del giocatore (1-99)</p>
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
                  <p className="text-green-600 text-xs mt-1">Reindirizzamento alla lista giocatori...</p>
                </div>
              )}

              {/* Pulsante Invio */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={
                    loading ||
                    !formData.name.trim() ||
                    !formData.position.trim() ||
                    !formData.birth_date ||
                    formData.height_cm <= 0 ||
                    formData.jersey_number <= 0
                  }
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creazione Giocatore...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Crea Giocatore
                    </>
                  )}
                </Button>

                <Button type="button" variant="outline" onClick={() => navigate('/players')} disabled={loading}>
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
              <strong>Nome:</strong> Nome completo del giocatore (nome e cognome)
            </p>
            <p>
              <strong>Posizione:</strong> Ruolo principale del giocatore in campo
            </p>
            <p>
              <strong>Altezza:</strong> Altezza in centimetri, deve essere realistica (100-300 cm)
            </p>
            <p>
              <strong>Data di Nascita:</strong> Il giocatore deve avere almeno 10 anni
            </p>
            <p>
              <strong>Numero di Maglia:</strong> Numero univoco per identificare il giocatore (1-99)
            </p>
            <p>
              <strong>Nota:</strong> Solo gli amministratori possono creare giocatori
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

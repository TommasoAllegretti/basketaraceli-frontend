import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { ArrowLeft, Plus, Calendar, Users, Trophy } from 'lucide-react'
import { createGame } from '@/api/gameService'
import { getTeams } from '@/api/teamService'
import { useAuth } from '@/contexts/AuthContext'
import type { Team } from '@/models/team'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'
import { ErrorDisplay } from '@/components/ErrorDisplay'
import { FormField, FormSelect, FormErrorSummary } from '@/components/ui/form-field'
import { validateGameForm, type GameFormData } from '@/lib/formValidation'

interface CreateGameData {
  date: string
  home_team_id: number
  away_team_id: number
  home_team_total_score: number | null
  away_team_total_score: number | null
  home_team_first_quarter_score: number | null
  away_team_first_quarter_score: number | null
  home_team_second_quarter_score: number | null
  away_team_second_quarter_score: number | null
  home_team_third_quarter_score: number | null
  away_team_third_quarter_score: number | null
  home_team_fourth_quarter_score: number | null
  away_team_fourth_quarter_score: number | null
}

function GameCreateContent() {
  const navigate = useNavigate()
  const { isAdmin, loading: authLoading } = useAuth()

  const [formData, setFormData] = useState<CreateGameData>({
    date: '',
    home_team_id: 0,
    away_team_id: 0,
    home_team_total_score: null,
    away_team_total_score: null,
    home_team_first_quarter_score: null,
    away_team_first_quarter_score: null,
    home_team_second_quarter_score: null,
    away_team_second_quarter_score: null,
    home_team_third_quarter_score: null,
    away_team_third_quarter_score: null,
    home_team_fourth_quarter_score: null,
    away_team_fourth_quarter_score: null,
  })

  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setDataLoading(true)
        const teamsData = await getTeams()
        setTeams(teamsData)
      } catch (err) {
        console.error('Errore nel caricamento delle squadre:', err)
        setError('Impossibile caricare le squadre')
      } finally {
        setDataLoading(false)
      }
    }

    fetchTeams()
  }, [])

  const handleInputChange = (field: keyof CreateGameData, value: string | number | null) => {
    const newFormData = {
      ...formData,
      [field]: value,
    }
    setFormData(newFormData)

    // Real-time validation
    const validation = validateGameForm(newFormData as GameFormData)
    setValidationErrors(validation.errors)

    // Clear messages when user starts typing
    if (error) setError(null)
    if (success) setSuccess(null)
  }

  const validateForm = (): boolean => {
    const validation = validateGameForm(formData as GameFormData)
    setValidationErrors(validation.errors)
    return validation.isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      setError('Correggi gli errori nel form prima di continuare')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const gameData: CreateGameData = {
        date: formData.date,
        home_team_id: formData.home_team_id,
        away_team_id: formData.away_team_id,
        home_team_total_score: null,
        away_team_total_score: null,
        home_team_first_quarter_score: null,
        away_team_first_quarter_score: null,
        home_team_second_quarter_score: null,
        away_team_second_quarter_score: null,
        home_team_third_quarter_score: null,
        away_team_third_quarter_score: null,
        home_team_fourth_quarter_score: null,
        away_team_fourth_quarter_score: null,
      }

      // Add score fields only if they have values
      if (formData.home_team_total_score !== null && formData.home_team_total_score >= 0) {
        gameData.home_team_total_score = formData.home_team_total_score
      }
      if (formData.away_team_total_score !== null && formData.away_team_total_score >= 0) {
        gameData.away_team_total_score = formData.away_team_total_score
      }
      if (formData.home_team_first_quarter_score !== null && formData.home_team_first_quarter_score >= 0) {
        gameData.home_team_first_quarter_score = formData.home_team_first_quarter_score
      }
      if (formData.away_team_first_quarter_score !== null && formData.away_team_first_quarter_score >= 0) {
        gameData.away_team_first_quarter_score = formData.away_team_first_quarter_score
      }
      if (formData.home_team_second_quarter_score !== null && formData.home_team_second_quarter_score >= 0) {
        gameData.home_team_second_quarter_score = formData.home_team_second_quarter_score
      }
      if (formData.away_team_second_quarter_score !== null && formData.away_team_second_quarter_score >= 0) {
        gameData.away_team_second_quarter_score = formData.away_team_second_quarter_score
      }
      if (formData.home_team_third_quarter_score !== null && formData.home_team_third_quarter_score >= 0) {
        gameData.home_team_third_quarter_score = formData.home_team_third_quarter_score
      }
      if (formData.away_team_third_quarter_score !== null && formData.away_team_third_quarter_score >= 0) {
        gameData.away_team_third_quarter_score = formData.away_team_third_quarter_score
      }
      if (formData.home_team_fourth_quarter_score !== null && formData.home_team_fourth_quarter_score >= 0) {
        gameData.home_team_fourth_quarter_score = formData.home_team_fourth_quarter_score
      }
      if (formData.away_team_fourth_quarter_score !== null && formData.away_team_fourth_quarter_score >= 0) {
        gameData.away_team_fourth_quarter_score = formData.away_team_fourth_quarter_score
      }

      const response = await createGame(gameData)

      setSuccess(response.message || 'Partita creata con successo')

      // Reset form
      setFormData({
        date: '',
        home_team_id: 0,
        away_team_id: 0,
        home_team_total_score: null,
        away_team_total_score: null,
        home_team_first_quarter_score: null,
        away_team_first_quarter_score: null,
        home_team_second_quarter_score: null,
        away_team_second_quarter_score: null,
        home_team_third_quarter_score: null,
        away_team_third_quarter_score: null,
        home_team_fourth_quarter_score: null,
        away_team_fourth_quarter_score: null,
      })

      // Reindirizza alla lista partite dopo un breve ritardo
      setTimeout(() => {
        navigate('/games')
      }, 2000)
    } catch (err: any) {
      console.error('Errore nella creazione della partita:', err)

      if (err && typeof err === 'object' && 'response' in err) {
        const error = err as { response?: { status?: number; data?: { message?: string } } }
        if (error.response?.status === 403) {
          setError('Non autorizzato. Solo gli amministratori possono creare partite.')
        } else if (error.response?.status === 422) {
          setError('Dati non validi. Controlla i campi del form.')
        } else if (typeof error.response?.status === 'number' && error.response.status >= 500) {
          setError('Errore del server. Riprova più tardi.')
        } else if (error.response?.data?.message) {
          setError(error.response.data.message)
        } else if (!navigator.onLine) {
          setError('Connessione internet non disponibile')
        } else {
          setError('Impossibile creare la partita. Riprova.')
        }
      } else if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Errore di connessione. Verifica la tua connessione internet')
      } else {
        setError('Impossibile creare la partita. Riprova.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Show loading while auth context is loading
  if (authLoading || dataLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/games')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alle Partite
          </Button>
        </div>
        <LoadingSkeleton type="form" title="Crea Nuova Partita" />
      </div>
    )
  }

  // Show unauthorized only after auth is loaded and user is confirmed not admin
  if (!authLoading && !isAdmin) {
    return (
      <ErrorDisplay
        error="Solo gli amministratori possono creare partite"
        onBack={() => navigate('/games')}
        title="Crea Nuova Partita"
        type="auth"
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Intestazione */}
      <div className="flex items-center gap-2 sm:gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/games')}
          className="touch-manipulation min-h-[44px]"
        >
          <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Torna alle Partite</span>
          <span className="sm:hidden">Indietro</span>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2 sm:gap-3">
          Crea Nuova Partita
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">Aggiungi una nuova partita al sistema</p>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 sm:px-0">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Informazioni Partita
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Data Partita */}
              <FormField
                id="date"
                label="Data Partita"
                type="date"
                value={formData.date}
                onChange={value => handleInputChange('date', value)}
                error={validationErrors.date}
                required
                icon={<Calendar className="h-4 w-4" />}
              />

              {/* Squadre */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Squadre
                </h3>

                {dataLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Squadra di Casa */}
                    <FormSelect
                      id="home_team"
                      label="Squadra di Casa"
                      value={formData.home_team_id}
                      onChange={value => handleInputChange('home_team_id', parseInt(value) || 0)}
                      options={teams.map(team => ({
                        value: team.id,
                        label: `${team.name} (${team.abbreviation})`,
                        disabled: team.id === formData.away_team_id,
                      }))}
                      error={validationErrors.home_team_id}
                      required
                      placeholder="Seleziona squadra di casa"
                    />

                    {/* Squadra Ospite */}
                    <FormSelect
                      id="away_team"
                      label="Squadra Ospite"
                      value={formData.away_team_id}
                      onChange={value => handleInputChange('away_team_id', parseInt(value) || 0)}
                      options={teams.map(team => ({
                        value: team.id,
                        label: `${team.name} (${team.abbreviation})`,
                        disabled: team.id === formData.home_team_id,
                      }))}
                      error={validationErrors.away_team_id}
                      required
                      placeholder="Seleziona squadra ospite"
                    />
                  </div>
                )}

                <p className="text-sm text-muted-foreground">Seleziona due squadre diverse per la partita</p>
              </div>

              {/* Punteggi Totali */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Punteggi Totali (Opzionali)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    id="home_total_score"
                    label="Punteggio Casa"
                    type="number"
                    value={formData.home_team_total_score || ''}
                    onChange={value => handleInputChange('home_team_total_score', value ? parseInt(value) : null)}
                    error={validationErrors.home_team_total_score}
                    placeholder="es. 85"
                    min="0"
                  />
                  <FormField
                    id="away_total_score"
                    label="Punteggio Ospite"
                    type="number"
                    value={formData.away_team_total_score || ''}
                    onChange={value => handleInputChange('away_team_total_score', value ? parseInt(value) : null)}
                    error={validationErrors.away_team_total_score}
                    placeholder="es. 78"
                    min="0"
                  />
                </div>
              </div>

              {/* Punteggi per Quarto */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Punteggi per Quarto (Opzionali)</h3>

                {/* Primo Quarto */}
                <div>
                  <h4 className="text-md font-medium mb-2">Primo Quarto</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      id="home_q1"
                      label="Casa - 1° Quarto"
                      type="number"
                      value={formData.home_team_first_quarter_score || ''}
                      onChange={value =>
                        handleInputChange('home_team_first_quarter_score', value ? parseInt(value) : null)
                      }
                      error={validationErrors.home_team_first_quarter_score}
                      placeholder="es. 20"
                      min="0"
                    />
                    <FormField
                      id="away_q1"
                      label="Ospite - 1° Quarto"
                      type="number"
                      value={formData.away_team_first_quarter_score || ''}
                      onChange={value =>
                        handleInputChange('away_team_first_quarter_score', value ? parseInt(value) : null)
                      }
                      error={validationErrors.away_team_first_quarter_score}
                      placeholder="es. 18"
                      min="0"
                    />
                  </div>
                </div>

                {/* Secondo Quarto */}
                <div>
                  <h4 className="text-md font-medium mb-2">Secondo Quarto</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      id="home_q2"
                      label="Casa - 2° Quarto"
                      type="number"
                      value={formData.home_team_second_quarter_score || ''}
                      onChange={value =>
                        handleInputChange('home_team_second_quarter_score', value ? parseInt(value) : null)
                      }
                      error={validationErrors.home_team_second_quarter_score}
                      placeholder="es. 22"
                      min="0"
                    />
                    <FormField
                      id="away_q2"
                      label="Ospite - 2° Quarto"
                      type="number"
                      value={formData.away_team_second_quarter_score || ''}
                      onChange={value =>
                        handleInputChange('away_team_second_quarter_score', value ? parseInt(value) : null)
                      }
                      error={validationErrors.away_team_second_quarter_score}
                      placeholder="es. 19"
                      min="0"
                    />
                  </div>
                </div>

                {/* Terzo Quarto */}
                <div>
                  <h4 className="text-md font-medium mb-2">Terzo Quarto</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      id="home_q3"
                      label="Casa - 3° Quarto"
                      type="number"
                      value={formData.home_team_third_quarter_score || ''}
                      onChange={value =>
                        handleInputChange('home_team_third_quarter_score', value ? parseInt(value) : null)
                      }
                      error={validationErrors.home_team_third_quarter_score}
                      placeholder="es. 21"
                      min="0"
                    />
                    <FormField
                      id="away_q3"
                      label="Ospite - 3° Quarto"
                      type="number"
                      value={formData.away_team_third_quarter_score || ''}
                      onChange={value =>
                        handleInputChange('away_team_third_quarter_score', value ? parseInt(value) : null)
                      }
                      error={validationErrors.away_team_third_quarter_score}
                      placeholder="es. 20"
                      min="0"
                    />
                  </div>
                </div>

                {/* Quarto Quarto */}
                <div>
                  <h4 className="text-md font-medium mb-2">Quarto Quarto</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      id="home_q4"
                      label="Casa - 4° Quarto"
                      type="number"
                      value={formData.home_team_fourth_quarter_score || ''}
                      onChange={value =>
                        handleInputChange('home_team_fourth_quarter_score', value ? parseInt(value) : null)
                      }
                      error={validationErrors.home_team_fourth_quarter_score}
                      placeholder="es. 22"
                      min="0"
                    />
                    <FormField
                      id="away_q4"
                      label="Ospite - 4° Quarto"
                      type="number"
                      value={formData.away_team_fourth_quarter_score || ''}
                      onChange={value =>
                        handleInputChange('away_team_fourth_quarter_score', value ? parseInt(value) : null)
                      }
                      error={validationErrors.away_team_fourth_quarter_score}
                      placeholder="es. 21"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Validation Errors Summary */}
              <FormErrorSummary errors={validationErrors} />

              {/* General Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Messaggio di Successo */}
              {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-600 text-sm">{success}</p>
                  <p className="text-green-600 text-xs mt-1">Reindirizzamento alla lista partite...</p>
                </div>
              )}

              {/* Pulsanti */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  type="submit"
                  disabled={
                    loading ||
                    !formData.date ||
                    !formData.home_team_id ||
                    !formData.away_team_id ||
                    Object.keys(validationErrors).length > 0
                  }
                  className="flex-1 touch-manipulation"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creazione Partita...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Crea Partita
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/games')}
                  disabled={loading}
                  className="touch-manipulation"
                >
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
              <strong>Data:</strong> Data della partita (obbligatoria, non può essere nel futuro)
            </p>
            <p>
              <strong>Squadre:</strong> Seleziona squadra di casa e squadra ospite (obbligatorie, devono essere diverse)
            </p>
            <p>
              <strong>Punteggi Totali:</strong> Punteggio finale di ogni squadra (opzionali)
            </p>
            <p>
              <strong>Punteggi per Quarto:</strong> Punteggi dettagliati per ogni quarto (opzionali)
            </p>
            <p>
              <strong>Validazione:</strong> Tutti i punteggi devono essere non negativi
            </p>
            <p>
              <strong>Nota:</strong> Solo gli amministratori possono creare partite
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function GameCreate() {
  return (
    <ErrorBoundary>
      <GameCreateContent />
    </ErrorBoundary>
  )
}

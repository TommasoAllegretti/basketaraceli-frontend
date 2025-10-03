import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save, AlertCircle, Calendar, Users, Trophy } from 'lucide-react'
import { getGame, updateGame } from '@/api/gameService'
import { getTeams } from '@/api/teamService'
import { useAuth } from '@/contexts/AuthContext'
import type { Game, UpdateGameData } from '@/models/game'
import type { Team } from '@/models/team'
import { validateGameForm, type GameFormData } from '@/lib/formValidation'

export function GameEdit() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const gameId = searchParams.get('id')
  const { isAdmin, loading: authLoading } = useAuth()

  const [game, setGame] = useState<Game | null>(null)
  const [formData, setFormData] = useState<UpdateGameData>({
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
  const [, setValidationErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchData = async () => {
      if (!gameId) {
        setError('ID partita non fornito')
        setDataLoading(false)
        return
      }

      const id = parseInt(gameId, 10)
      if (isNaN(id)) {
        setError('ID partita non valido')
        setDataLoading(false)
        return
      }

      try {
        setDataLoading(true)
        const [gameData, teamsData] = await Promise.all([getGame(id), getTeams()])

        setGame(gameData)
        setTeams(teamsData)

        // Popola il form con i dati esistenti
        setFormData({
          date: gameData.date,
          home_team_id: gameData.home_team_id,
          away_team_id: gameData.away_team_id,
          home_team_total_score: gameData.home_team_total_score,
          away_team_total_score: gameData.away_team_total_score,
          home_team_first_quarter_score: gameData.home_team_first_quarter_score,
          away_team_first_quarter_score: gameData.away_team_first_quarter_score,
          home_team_second_quarter_score: gameData.home_team_second_quarter_score,
          away_team_second_quarter_score: gameData.away_team_second_quarter_score,
          home_team_third_quarter_score: gameData.home_team_third_quarter_score,
          away_team_third_quarter_score: gameData.away_team_third_quarter_score,
          home_team_fourth_quarter_score: gameData.home_team_fourth_quarter_score,
          away_team_fourth_quarter_score: gameData.away_team_fourth_quarter_score,
        })
      } catch (err: unknown) {
        console.error('Errore nel recupero dei dati:', err)
        if (err && typeof err === 'object' && 'response' in err) {
          const error = err as { response?: { status?: number; data?: { message?: string } } }
          if (error.response?.status === 403) {
            setError('Non autorizzato. Non hai i permessi per modificare questa partita.')
          } else if (error.response?.status === 404) {
            setError('Partita non trovata.')
          } else {
            setError('Impossibile caricare i dati della partita')
          }
        } else {
          setError('Impossibile caricare i dati della partita')
        }
      } finally {
        setDataLoading(false)
      }
    }

    fetchData()
  }, [gameId])

  const handleInputChange = (field: keyof UpdateGameData, value: string | number | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))

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

    if (!gameId) {
      setError('ID partita mancante')
      return
    }

    if (!validateForm()) {
      setError('Correggi gli errori nel form prima di continuare')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const gameData: UpdateGameData = {
        date: formData.date,
        home_team_id: formData.home_team_id,
        away_team_id: formData.away_team_id,
      }

      // Add score fields only if they have values
      if (
        formData.home_team_total_score !== null &&
        formData.home_team_total_score !== undefined &&
        formData.home_team_total_score >= 0
      ) {
        gameData.home_team_total_score = formData.home_team_total_score
      }
      if (
        formData.away_team_total_score !== null &&
        formData.away_team_total_score !== undefined &&
        formData.away_team_total_score >= 0
      ) {
        gameData.away_team_total_score = formData.away_team_total_score
      }
      if (
        formData.home_team_first_quarter_score !== null &&
        formData.home_team_first_quarter_score !== undefined &&
        formData.home_team_first_quarter_score >= 0
      ) {
        gameData.home_team_first_quarter_score = formData.home_team_first_quarter_score
      }
      if (
        formData.away_team_first_quarter_score !== null &&
        formData.away_team_first_quarter_score !== undefined &&
        formData.away_team_first_quarter_score >= 0
      ) {
        gameData.away_team_first_quarter_score = formData.away_team_first_quarter_score
      }
      if (
        formData.home_team_second_quarter_score !== null &&
        formData.home_team_second_quarter_score !== undefined &&
        formData.home_team_second_quarter_score >= 0
      ) {
        gameData.home_team_second_quarter_score = formData.home_team_second_quarter_score
      }
      if (
        formData.away_team_second_quarter_score !== null &&
        formData.away_team_second_quarter_score !== undefined &&
        formData.away_team_second_quarter_score >= 0
      ) {
        gameData.away_team_second_quarter_score = formData.away_team_second_quarter_score
      }
      if (
        formData.home_team_third_quarter_score !== null &&
        formData.home_team_third_quarter_score !== undefined &&
        formData.home_team_third_quarter_score >= 0
      ) {
        gameData.home_team_third_quarter_score = formData.home_team_third_quarter_score
      }
      if (
        formData.away_team_third_quarter_score !== null &&
        formData.away_team_third_quarter_score !== undefined &&
        formData.away_team_third_quarter_score >= 0
      ) {
        gameData.away_team_third_quarter_score = formData.away_team_third_quarter_score
      }
      if (
        formData.home_team_fourth_quarter_score !== null &&
        formData.home_team_fourth_quarter_score !== undefined &&
        formData.home_team_fourth_quarter_score >= 0
      ) {
        gameData.home_team_fourth_quarter_score = formData.home_team_fourth_quarter_score
      }
      if (
        formData.away_team_fourth_quarter_score !== null &&
        formData.away_team_fourth_quarter_score !== undefined &&
        formData.away_team_fourth_quarter_score >= 0
      ) {
        gameData.away_team_fourth_quarter_score = formData.away_team_fourth_quarter_score
      }

      const response = await updateGame(parseInt(gameId, 10), gameData)

      setSuccess(response.message || 'Partita aggiornata con successo')

      // Reindirizza alla pagina della partita dopo un breve ritardo
      setTimeout(() => {
        navigate(`/game?id=${gameId}`)
      }, 2000)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const error = err as { response?: { status?: number; data?: { message?: string } } }
        if (error.response?.status === 403) {
          setError('Non autorizzato. Solo gli amministratori possono modificare partite.')
        } else if (error.response?.data?.message) {
          setError(error.response.data.message)
        } else {
          setError('Impossibile aggiornare la partita. Riprova.')
        }
      } else {
        setError('Impossibile aggiornare la partita. Riprova.')
      }
      console.error("Errore nell'aggiornamento della partita:", err)
    } finally {
      setLoading(false)
    }
  }

  if (dataLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/games')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alle Partite
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifica Partita</h1>
          <p className="text-muted-foreground">Caricamento dati partita...</p>
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
          <Button variant="outline" size="sm" onClick={() => navigate('/games')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alle Partite
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifica Partita</h1>
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
          <Button variant="outline" size="sm" onClick={() => navigate('/games')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alle Partite
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifica Partita</h1>
          <p className="text-muted-foreground">Modifica una partita esistente</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">Accesso Non Autorizzato</p>
              <p className="text-muted-foreground mb-4">Solo gli amministratori possono modificare partite.</p>
              <Button onClick={() => navigate('/games')}>Torna alle Partite</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !game) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/games')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alle Partite
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifica Partita</h1>
          <p className="text-muted-foreground">Modifica una partita esistente</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => navigate('/games')}>Torna alle Partite</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Intestazione */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/games')}
          className="touch-manipulation min-h-[44px] w-full sm:w-auto"
        >
          <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Torna alle Partite</span>
          <span className="sm:hidden">Indietro</span>
        </Button>
        {game && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/game?id=${game.id}`)}
            className="touch-manipulation min-h-[44px] w-full sm:w-auto"
          >
            Visualizza Partita
          </Button>
        )}
      </div>

      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight flex items-start sm:items-center gap-2 sm:gap-3">
          <Save className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0 mt-1 sm:mt-0" />
          <span className="break-words">Modifica Partita</span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {game ? `Modifica ${game.home_team.name} vs ${game.away_team.name}` : 'Modifica una partita esistente'}
        </p>
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
              <div className="space-y-2">
                <Label htmlFor="date">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Data Partita <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={e => handleInputChange('date', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Seleziona la data della partita (non può essere nel futuro)
                </p>
              </div>

              {/* Squadre */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Squadre
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Squadra di Casa */}
                  <div className="space-y-2">
                    <Label htmlFor="home_team">
                      Squadra di Casa <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="home_team"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.home_team_id}
                      onChange={e => handleInputChange('home_team_id', parseInt(e.target.value) || 0)}
                      required
                    >
                      <option value={0}>Seleziona squadra di casa</option>
                      {teams.map(team => (
                        <option key={team.id} value={team.id} disabled={team.id === formData.away_team_id}>
                          {team.name} ({team.abbreviation})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Squadra Ospite */}
                  <div className="space-y-2">
                    <Label htmlFor="away_team">
                      Squadra Ospite <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="away_team"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.away_team_id}
                      onChange={e => handleInputChange('away_team_id', parseInt(e.target.value) || 0)}
                      required
                    >
                      <option value={0}>Seleziona squadra ospite</option>
                      {teams.map(team => (
                        <option key={team.id} value={team.id} disabled={team.id === formData.home_team_id}>
                          {team.name} ({team.abbreviation})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">Seleziona due squadre diverse per la partita</p>
              </div>

              {/* Punteggi Totali */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Punteggi Totali (Opzionali)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="home_total_score">Punteggio Casa</Label>
                    <Input
                      id="home_total_score"
                      type="number"
                      placeholder="es. 85"
                      value={formData.home_team_total_score || ''}
                      onChange={e =>
                        handleInputChange('home_team_total_score', e.target.value ? parseInt(e.target.value) : null)
                      }
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="away_total_score">Punteggio Ospite</Label>
                    <Input
                      id="away_total_score"
                      type="number"
                      placeholder="es. 78"
                      value={formData.away_team_total_score || ''}
                      onChange={e =>
                        handleInputChange('away_team_total_score', e.target.value ? parseInt(e.target.value) : null)
                      }
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Punteggi per Quarto */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Punteggi per Quarto (Opzionali)</h3>

                {/* Primo Quarto */}
                <div>
                  <h4 className="text-md font-medium mb-2">Primo Quarto</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="home_q1">Casa - 1° Quarto</Label>
                      <Input
                        id="home_q1"
                        type="number"
                        placeholder="es. 20"
                        value={formData.home_team_first_quarter_score || ''}
                        onChange={e =>
                          handleInputChange(
                            'home_team_first_quarter_score',
                            e.target.value ? parseInt(e.target.value) : null,
                          )
                        }
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="away_q1">Ospite - 1° Quarto</Label>
                      <Input
                        id="away_q1"
                        type="number"
                        placeholder="es. 18"
                        value={formData.away_team_first_quarter_score || ''}
                        onChange={e =>
                          handleInputChange(
                            'away_team_first_quarter_score',
                            e.target.value ? parseInt(e.target.value) : null,
                          )
                        }
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Secondo Quarto */}
                <div>
                  <h4 className="text-md font-medium mb-2">Secondo Quarto</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="home_q2">Casa - 2° Quarto</Label>
                      <Input
                        id="home_q2"
                        type="number"
                        placeholder="es. 22"
                        value={formData.home_team_second_quarter_score || ''}
                        onChange={e =>
                          handleInputChange(
                            'home_team_second_quarter_score',
                            e.target.value ? parseInt(e.target.value) : null,
                          )
                        }
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="away_q2">Ospite - 2° Quarto</Label>
                      <Input
                        id="away_q2"
                        type="number"
                        placeholder="es. 19"
                        value={formData.away_team_second_quarter_score || ''}
                        onChange={e =>
                          handleInputChange(
                            'away_team_second_quarter_score',
                            e.target.value ? parseInt(e.target.value) : null,
                          )
                        }
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Terzo Quarto */}
                <div>
                  <h4 className="text-md font-medium mb-2">Terzo Quarto</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="home_q3">Casa - 3° Quarto</Label>
                      <Input
                        id="home_q3"
                        type="number"
                        placeholder="es. 21"
                        value={formData.home_team_third_quarter_score || ''}
                        onChange={e =>
                          handleInputChange(
                            'home_team_third_quarter_score',
                            e.target.value ? parseInt(e.target.value) : null,
                          )
                        }
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="away_q3">Ospite - 3° Quarto</Label>
                      <Input
                        id="away_q3"
                        type="number"
                        placeholder="es. 20"
                        value={formData.away_team_third_quarter_score || ''}
                        onChange={e =>
                          handleInputChange(
                            'away_team_third_quarter_score',
                            e.target.value ? parseInt(e.target.value) : null,
                          )
                        }
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Quarto Quarto */}
                <div>
                  <h4 className="text-md font-medium mb-2">Quarto Quarto</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="home_q4">Casa - 4° Quarto</Label>
                      <Input
                        id="home_q4"
                        type="number"
                        placeholder="es. 22"
                        value={formData.home_team_fourth_quarter_score || ''}
                        onChange={e =>
                          handleInputChange(
                            'home_team_fourth_quarter_score',
                            e.target.value ? parseInt(e.target.value) : null,
                          )
                        }
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="away_q4">Ospite - 4° Quarto</Label>
                      <Input
                        id="away_q4"
                        type="number"
                        placeholder="es. 21"
                        value={formData.away_team_fourth_quarter_score || ''}
                        onChange={e =>
                          handleInputChange(
                            'away_team_fourth_quarter_score',
                            e.target.value ? parseInt(e.target.value) : null,
                          )
                        }
                        min="0"
                      />
                    </div>
                  </div>
                </div>
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
                  <p className="text-green-600 text-xs mt-1">Reindirizzamento alla pagina partita...</p>
                </div>
              )}

              {/* Pulsanti */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  type="submit"
                  disabled={loading || !formData.date || !formData.home_team_id || !formData.away_team_id}
                  className="flex-1 touch-manipulation"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Aggiornamento Partita...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Aggiorna Partita
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
              <strong>Nota:</strong> Solo gli amministratori possono modificare partite
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Plus, AlertCircle, BarChart3, Target, Zap, Shield } from 'lucide-react'
import { createGameStat } from '@/api/gameStatService'
import { getTeams } from '@/api/teamService'
import { getGames } from '@/api/gameService'
import { useAuth } from '@/contexts/AuthContext'
import type { Team } from '@/models/team'
import type { Game } from '@/models/game'
import { FormField, FormSelect, FormErrorSummary } from '@/components/ui/form-field'
import { validateGameStatForm, type GameStatFormData } from '@/lib/formValidation'
import type { CreateGameStatData } from '@/models/gameStat'

export function GameStatCreate() {
  const navigate = useNavigate()
  const { isAdmin, loading: authLoading } = useAuth()

  const [formData, setFormData] = useState<CreateGameStatData>({
    team_id: 0,
    game_id: 0,
    points: null,
    field_goals_attempted: null,
    field_goals_made: null,
    three_point_field_goals_made: null,
    three_point_field_goals_attempted: null,
    two_point_field_goals_made: null,
    two_point_field_goals_attempted: null,
    free_throws_made: null,
    free_throws_attempted: null,
    offensive_rebounds: null,
    defensive_rebounds: null,
    total_rebounds: null,
    assists: null,
    turnovers: null,
    steals: null,
    blocks: null,
    personal_fouls: null,
  })

  const [, setTeams] = useState<Team[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Calculated percentages
  const [calculatedPercentages, setCalculatedPercentages] = useState({
    fieldGoalPercentage: null as number | null,
    threePointPercentage: null as number | null,
    twoPointPercentage: null as number | null,
    freeThrowPercentage: null as number | null,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoading(true)
        const [teamsData, gamesData] = await Promise.all([getTeams(), getGames()])
        setTeams(teamsData)
        setGames(gamesData)
      } catch (err) {
        console.error('Errore nel caricamento dei dati:', err)
        setError('Impossibile caricare squadre e partite')
      } finally {
        setDataLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate percentages when shooting stats change
  useEffect(() => {
    const calculatePercentages = () => {
      const newPercentages = { ...calculatedPercentages }

      // Field goal percentage
      if (
        formData.field_goals_made !== null &&
        formData.field_goals_attempted !== null &&
        formData.field_goals_attempted !== null &&
        formData.field_goals_attempted != null &&
        formData.field_goals_attempted > 0
      ) {
        newPercentages.fieldGoalPercentage =
          Math.round(((formData.field_goals_made ?? 0) / formData.field_goals_attempted) * 100 * 10) / 10
      } else {
        newPercentages.fieldGoalPercentage = null
      }

      // Three-point percentage
      if (
        formData.three_point_field_goals_made !== null &&
        formData.three_point_field_goals_attempted !== null &&
        formData.three_point_field_goals_attempted != null &&
        formData.three_point_field_goals_attempted > 0
      ) {
        newPercentages.threePointPercentage =
          Math.round(
            ((formData.three_point_field_goals_made ?? 0) / formData.three_point_field_goals_attempted) * 100 * 10,
          ) / 10
      } else {
        newPercentages.threePointPercentage = null
      }

      // Two-point percentage
      if (
        formData.two_point_field_goals_made !== null &&
        formData.two_point_field_goals_attempted !== null &&
        formData.two_point_field_goals_attempted !== null &&
        formData.two_point_field_goals_attempted !== undefined &&
        formData.two_point_field_goals_attempted > 0
      ) {
        newPercentages.twoPointPercentage =
          Math.round(
            ((formData.two_point_field_goals_made ?? 0) / formData.two_point_field_goals_attempted) * 100 * 10,
          ) / 10
      } else {
        newPercentages.twoPointPercentage = null
      }

      // Free throw percentage
      if (
        formData.free_throws_made !== null &&
        formData.free_throws_made !== undefined &&
        formData.free_throws_attempted !== null &&
        formData.free_throws_attempted !== undefined &&
        formData.free_throws_attempted > 0
      ) {
        newPercentages.freeThrowPercentage =
          Math.round(((formData.free_throws_made ?? 0) / formData.free_throws_attempted) * 100 * 10) / 10
      } else {
        newPercentages.freeThrowPercentage = null
      }

      setCalculatedPercentages(newPercentages)
    }

    calculatePercentages()
  }, [
    formData.field_goals_made,
    formData.field_goals_attempted,
    formData.three_point_field_goals_made,
    formData.three_point_field_goals_attempted,
    formData.two_point_field_goals_made,
    formData.two_point_field_goals_attempted,
    formData.free_throws_made,
    formData.free_throws_attempted,
    calculatedPercentages,
  ])

  const handleInputChange = (field: keyof CreateGameStatData, value: string | number | null) => {
    const numericValue = typeof value === 'string' && value !== '' ? parseInt(value) : value === '' ? null : value

    const newFormData = {
      ...formData,
      [field]: numericValue,
    }
    setFormData(newFormData)

    // Real-time validation
    const validation = validateGameStatForm(newFormData as GameStatFormData, games)
    setValidationErrors(validation.errors)

    // Clear messages when user starts typing
    if (error) setError(null)
    if (success) setSuccess(null)
  }

  const validateForm = (): boolean => {
    const validation = validateGameStatForm(formData as GameStatFormData, games)
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

      const statData: CreateGameStatData = {
        team_id: formData.team_id,
        game_id: formData.game_id,
      }

      // Add statistical fields only if they have values
      if (formData.points !== null) statData.points = formData.points
      if (formData.field_goals_attempted !== null) statData.field_goals_attempted = formData.field_goals_attempted
      if (formData.field_goals_made !== null) statData.field_goals_made = formData.field_goals_made
      if (formData.three_point_field_goals_made !== null)
        statData.three_point_field_goals_made = formData.three_point_field_goals_made
      if (formData.three_point_field_goals_attempted !== null)
        statData.three_point_field_goals_attempted = formData.three_point_field_goals_attempted
      if (formData.two_point_field_goals_made !== null)
        statData.two_point_field_goals_made = formData.two_point_field_goals_made
      if (formData.two_point_field_goals_attempted !== null)
        statData.two_point_field_goals_attempted = formData.two_point_field_goals_attempted
      if (formData.free_throws_made !== null) statData.free_throws_made = formData.free_throws_made
      if (formData.free_throws_attempted !== null) statData.free_throws_attempted = formData.free_throws_attempted
      if (formData.offensive_rebounds !== null) statData.offensive_rebounds = formData.offensive_rebounds
      if (formData.defensive_rebounds !== null) statData.defensive_rebounds = formData.defensive_rebounds
      if (formData.total_rebounds !== null) statData.total_rebounds = formData.total_rebounds
      if (formData.assists !== null) statData.assists = formData.assists
      if (formData.turnovers !== null) statData.turnovers = formData.turnovers
      if (formData.steals !== null) statData.steals = formData.steals
      if (formData.blocks !== null) statData.blocks = formData.blocks
      if (formData.personal_fouls !== null) statData.personal_fouls = formData.personal_fouls

      const response = await createGameStat(statData)

      setSuccess(response.message || 'Statistiche create con successo')

      // Reset form
      setFormData({
        team_id: 0,
        game_id: 0,
        points: null,
        field_goals_attempted: null,
        field_goals_made: null,
        three_point_field_goals_made: null,
        three_point_field_goals_attempted: null,
        two_point_field_goals_made: null,
        two_point_field_goals_attempted: null,
        free_throws_made: null,
        free_throws_attempted: null,
        offensive_rebounds: null,
        defensive_rebounds: null,
        total_rebounds: null,
        assists: null,
        turnovers: null,
        steals: null,
        blocks: null,
        personal_fouls: null,
      })

      // Redirect to game stats list after a brief delay
      setTimeout(() => {
        navigate('/game-stats')
      }, 2000)
    } catch (err: any) {
      if (err && typeof err === 'object' && 'response' in err) {
        const error = err as { response?: { status?: number; data?: { message?: string } } }
        if (error.response?.status === 403) {
          setError('Non autorizzato. Solo gli amministratori possono creare statistiche.')
        } else if (error.response?.data?.message) {
          setError(error.response.data.message)
        } else {
          setError('Impossibile creare le statistiche. Riprova.')
        }
      } else {
        setError('Impossibile creare le statistiche. Riprova.')
      }
      console.error('Errore nella creazione delle statistiche:', err)
    } finally {
      setLoading(false)
    }
  }

  // Show loading while auth context is loading
  if (authLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/game-stats')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alle Statistiche
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crea Nuove Statistiche</h1>
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
          <Button variant="outline" size="sm" onClick={() => navigate('/game-stats')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alle Statistiche
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crea Nuove Statistiche</h1>
          <p className="text-muted-foreground">Aggiungi nuove statistiche di partita al sistema</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">Accesso Non Autorizzato</p>
              <p className="text-muted-foreground mb-4">Solo gli amministratori possono creare statistiche.</p>
              <Button onClick={() => navigate('/game-stats')}>Torna alle Statistiche</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/game-stats')}
          className="touch-manipulation min-h-[44px]"
        >
          <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Torna alle Statistiche</span>
          <span className="sm:hidden">Indietro</span>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2 sm:gap-3">
          Crea Nuove Statistiche
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">Aggiungi nuove statistiche di partita al sistema</p>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-0">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Informazioni Base
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Team and Game Selection */}
              <div className="space-y-4">
                {dataLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Game Selection */}
                    <FormSelect
                      id="game"
                      label="Partita"
                      value={formData.game_id}
                      onChange={value => handleInputChange('game_id', parseInt(value) || 0)}
                      options={games.map(game => ({
                        value: game.id,
                        label: `${new Date(game.date).toLocaleDateString('it-IT')} - ${game.home_team.name} vs ${game.away_team.name}`,
                      }))}
                      error={validationErrors.game_id}
                      required
                      placeholder="Seleziona partita"
                    />

                    {/* Team Selection */}
                    <FormSelect
                      id="team"
                      label="Squadra"
                      value={formData.team_id}
                      onChange={(value: string) => handleInputChange('team_id', parseInt(value) || 0)}
                      options={
                        formData.game_id > 0
                          ? (() => {
                              const selectedGame = games.find(game => game.id === formData.game_id)
                              if (selectedGame) {
                                return [
                                  { value: selectedGame.home_team.id, label: `${selectedGame.home_team.name} (Casa)` },
                                  {
                                    value: selectedGame.away_team.id,
                                    label: `${selectedGame.away_team.name} (Ospite)`,
                                  },
                                ]
                              }
                              return []
                            })()
                          : []
                      }
                      error={validationErrors.team_id}
                      required
                      placeholder="Seleziona squadra"
                    />
                  </div>
                )}

                <p className="text-sm text-muted-foreground">
                  Seleziona prima la partita, poi la squadra per cui inserire le statistiche
                </p>
              </div>

              {/* Shooting Statistics */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Statistiche di Tiro
                </h3>

                {/* Points */}
                <FormField
                  id="points"
                  label="Punti Totali"
                  type="number"
                  value={formData.points || ''}
                  onChange={value => handleInputChange('points', value)}
                  error={validationErrors.points}
                  placeholder="es. 85"
                  min="0"
                />

                {/* Field Goals */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="field_goals_made">Tiri dal Campo Realizzati</Label>
                    <Input
                      id="field_goals_made"
                      type="number"
                      placeholder="es. 30"
                      value={formData.field_goals_made || ''}
                      onChange={e => handleInputChange('field_goals_made', e.target.value)}
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="field_goals_attempted">Tiri dal Campo Tentati</Label>
                    <Input
                      id="field_goals_attempted"
                      type="number"
                      placeholder="es. 65"
                      value={formData.field_goals_attempted || ''}
                      onChange={e => handleInputChange('field_goals_attempted', e.target.value)}
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Percentuale Tiri dal Campo</Label>
                    <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                      {calculatedPercentages.fieldGoalPercentage !== null
                        ? `${calculatedPercentages.fieldGoalPercentage}%`
                        : '-'}
                    </div>
                  </div>
                </div>

                {/* Three-Point Field Goals */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="three_point_made">Tiri da 3 Realizzati</Label>
                    <Input
                      id="three_point_made"
                      type="number"
                      placeholder="es. 8"
                      value={formData.three_point_field_goals_made || ''}
                      onChange={e => handleInputChange('three_point_field_goals_made', e.target.value)}
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="three_point_attempted">Tiri da 3 Tentati</Label>
                    <Input
                      id="three_point_attempted"
                      type="number"
                      placeholder="es. 20"
                      value={formData.three_point_field_goals_attempted || ''}
                      onChange={e => handleInputChange('three_point_field_goals_attempted', e.target.value)}
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Percentuale Tiri da 3</Label>
                    <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                      {calculatedPercentages.threePointPercentage !== null
                        ? `${calculatedPercentages.threePointPercentage}%`
                        : '-'}
                    </div>
                  </div>
                </div>

                {/* Two-Point Field Goals */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="two_point_made">Tiri da 2 Realizzati</Label>
                    <Input
                      id="two_point_made"
                      type="number"
                      placeholder="es. 22"
                      value={formData.two_point_field_goals_made || ''}
                      onChange={e => handleInputChange('two_point_field_goals_made', e.target.value)}
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="two_point_attempted">Tiri da 2 Tentati</Label>
                    <Input
                      id="two_point_attempted"
                      type="number"
                      placeholder="es. 45"
                      value={formData.two_point_field_goals_attempted || ''}
                      onChange={e => handleInputChange('two_point_field_goals_attempted', e.target.value)}
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Percentuale Tiri da 2</Label>
                    <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                      {calculatedPercentages.twoPointPercentage !== null
                        ? `${calculatedPercentages.twoPointPercentage}%`
                        : '-'}
                    </div>
                  </div>
                </div>

                {/* Free Throws */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="free_throws_made">Tiri Liberi Realizzati</Label>
                    <Input
                      id="free_throws_made"
                      type="number"
                      placeholder="es. 15"
                      value={formData.free_throws_made || ''}
                      onChange={e => handleInputChange('free_throws_made', e.target.value)}
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="free_throws_attempted">Tiri Liberi Tentati</Label>
                    <Input
                      id="free_throws_attempted"
                      type="number"
                      placeholder="es. 20"
                      value={formData.free_throws_attempted || ''}
                      onChange={e => handleInputChange('free_throws_attempted', e.target.value)}
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Percentuale Tiri Liberi</Label>
                    <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                      {calculatedPercentages.freeThrowPercentage !== null
                        ? `${calculatedPercentages.freeThrowPercentage}%`
                        : '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Rebounds */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Rimbalzi
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="offensive_rebounds">Rimbalzi Offensivi</Label>
                    <Input
                      id="offensive_rebounds"
                      type="number"
                      placeholder="es. 12"
                      value={formData.offensive_rebounds || ''}
                      onChange={e => handleInputChange('offensive_rebounds', e.target.value)}
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defensive_rebounds">Rimbalzi Difensivi</Label>
                    <Input
                      id="defensive_rebounds"
                      type="number"
                      placeholder="es. 35"
                      value={formData.defensive_rebounds || ''}
                      onChange={e => handleInputChange('defensive_rebounds', e.target.value)}
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="total_rebounds">Rimbalzi Totali</Label>
                    <Input
                      id="total_rebounds"
                      type="number"
                      placeholder="es. 47"
                      value={formData.total_rebounds || ''}
                      onChange={e => handleInputChange('total_rebounds', e.target.value)}
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Other Statistics */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Altre Statistiche
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="assists">Assist</Label>
                    <Input
                      id="assists"
                      type="number"
                      placeholder="es. 18"
                      value={formData.assists || ''}
                      onChange={e => handleInputChange('assists', e.target.value)}
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="turnovers">Palle Perse</Label>
                    <Input
                      id="turnovers"
                      type="number"
                      placeholder="es. 12"
                      value={formData.turnovers || ''}
                      onChange={e => handleInputChange('turnovers', e.target.value)}
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="steals">Palle Rubate</Label>
                    <Input
                      id="steals"
                      type="number"
                      placeholder="es. 8"
                      value={formData.steals || ''}
                      onChange={e => handleInputChange('steals', e.target.value)}
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="blocks">Stoppate</Label>
                    <Input
                      id="blocks"
                      type="number"
                      placeholder="es. 5"
                      value={formData.blocks || ''}
                      onChange={e => handleInputChange('blocks', e.target.value)}
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="personal_fouls">Falli Personali</Label>
                    <Input
                      id="personal_fouls"
                      type="number"
                      placeholder="es. 20"
                      value={formData.personal_fouls || ''}
                      onChange={e => handleInputChange('personal_fouls', e.target.value)}
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-600 text-sm">{success}</p>
                  <p className="text-green-600 text-xs mt-1">Reindirizzamento alla lista statistiche...</p>
                </div>
              )}

              {/* Validation Errors Summary */}
              <FormErrorSummary errors={validationErrors} />

              {/* General Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-600 text-sm">{success}</p>
                  <p className="text-green-600 text-xs mt-1">Reindirizzamento alla lista statistiche...</p>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={
                    loading || !formData.team_id || !formData.game_id || Object.keys(validationErrors).length > 0
                  }
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creazione Statistiche...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Crea Statistiche
                    </>
                  )}
                </Button>

                <Button type="button" variant="outline" onClick={() => navigate('/game-stats')} disabled={loading}>
                  Annulla
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Aiuto</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Partita e Squadra:</strong> Seleziona prima la partita, poi la squadra (obbligatori)
            </p>
            <p>
              <strong>Statistiche di Tiro:</strong> Le percentuali vengono calcolate automaticamente
            </p>
            <p>
              <strong>Validazione:</strong> I tiri realizzati non possono superare quelli tentati
            </p>
            <p>
              <strong>Rimbalzi:</strong> I rimbalzi totali dovrebbero essere la somma di offensivi e difensivi
            </p>
            <p>
              <strong>Valori:</strong> Tutti i valori devono essere non negativi
            </p>
            <p>
              <strong>Nota:</strong> Solo gli amministratori possono creare statistiche
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

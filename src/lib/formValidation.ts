// Form validation utilities for games and game statistics

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export interface FieldValidationResult {
  isValid: boolean
  error?: string
}

// Game form validation
export interface GameFormData {
  date: string
  home_team_id: number
  away_team_id: number
  home_team_total_score?: number | null
  away_team_total_score?: number | null
  home_team_first_quarter_score?: number | null
  away_team_first_quarter_score?: number | null
  home_team_second_quarter_score?: number | null
  away_team_second_quarter_score?: number | null
  home_team_third_quarter_score?: number | null
  away_team_third_quarter_score?: number | null
  home_team_fourth_quarter_score?: number | null
  away_team_fourth_quarter_score?: number | null
}

// Game statistics form validation
export interface GameStatFormData {
  team_id: number
  game_id: number
  points?: number | null
  field_goals_attempted?: number | null
  field_goals_made?: number | null
  three_point_field_goals_made?: number | null
  three_point_field_goals_attempted?: number | null
  two_point_field_goals_made?: number | null
  two_point_field_goals_attempted?: number | null
  free_throws_made?: number | null
  free_throws_attempted?: number | null
  offensive_rebounds?: number | null
  defensive_rebounds?: number | null
  total_rebounds?: number | null
  assists?: number | null
  turnovers?: number | null
  steals?: number | null
  blocks?: number | null
  personal_fouls?: number | null
}

// Individual field validators
export const validateDate = (date: string): FieldValidationResult => {
  if (!date) {
    return { isValid: false, error: 'La data è obbligatoria' }
  }

  const gameDate = new Date(date)
  const today = new Date()
  today.setHours(23, 59, 59, 999)

  if (isNaN(gameDate.getTime())) {
    return { isValid: false, error: 'Formato data non valido' }
  }

  return { isValid: true }
}

export const validateTeamSelection = (homeTeamId: number, awayTeamId: number): FieldValidationResult => {
  if (!homeTeamId || homeTeamId === 0) {
    return { isValid: false, error: 'La squadra di casa è obbligatoria' }
  }

  if (!awayTeamId || awayTeamId === 0) {
    return { isValid: false, error: 'La squadra ospite è obbligatoria' }
  }

  if (homeTeamId === awayTeamId) {
    return { isValid: false, error: 'La squadra di casa e la squadra ospite devono essere diverse' }
  }

  return { isValid: true }
}

export const validateScore = (score: number | null, fieldName: string): FieldValidationResult => {
  if (score !== null && score !== undefined) {
    if (score < 0) {
      return { isValid: false, error: `${fieldName} non può essere negativo` }
    }
    if (!Number.isInteger(score)) {
      return { isValid: false, error: `${fieldName} deve essere un numero intero` }
    }
  }
  return { isValid: true }
}

export const validateShootingStats = (
  made: number | null,
  attempted: number | null,
  statName: string,
): FieldValidationResult => {
  if (made !== null && attempted !== null) {
    if (made < 0 || attempted < 0) {
      return { isValid: false, error: `${statName} non possono essere negativi` }
    }
    if (made > attempted) {
      return { isValid: false, error: `${statName} realizzati non possono essere superiori ai tentati` }
    }
    if (!Number.isInteger(made) || !Number.isInteger(attempted)) {
      return { isValid: false, error: `${statName} devono essere numeri interi` }
    }
  } else if ((made !== null && attempted === null) || (made === null && attempted !== null)) {
    return { isValid: false, error: `Se inserisci ${statName}, devi inserire sia realizzati che tentati` }
  }
  return { isValid: true }
}

export const validateRebounds = (
  offensive: number | null,
  defensive: number | null,
  total: number | null,
): FieldValidationResult => {
  if (offensive !== null && defensive !== null && total !== null) {
    if (offensive < 0 || defensive < 0 || total < 0) {
      return { isValid: false, error: 'I rimbalzi non possono essere negativi' }
    }
    if (offensive + defensive !== total) {
      return {
        isValid: false,
        error: 'I rimbalzi totali devono essere uguali alla somma di rimbalzi offensivi e difensivi',
      }
    }
  }
  return { isValid: true }
}

export const validateNonNegativeInteger = (value: number | null, fieldName: string): FieldValidationResult => {
  if (value !== null && value !== undefined) {
    if (value < 0) {
      return { isValid: false, error: `${fieldName} non può essere negativo` }
    }
    if (!Number.isInteger(value)) {
      return { isValid: false, error: `${fieldName} deve essere un numero intero` }
    }
  }
  return { isValid: true }
}

// Comprehensive game form validation
export const validateGameForm = (formData: GameFormData): ValidationResult => {
  const errors: Record<string, string> = {}

  // Validate date
  const dateValidation = validateDate(formData.date)
  if (!dateValidation.isValid) {
    errors.date = dateValidation.error!
  }

  // Validate team selection
  const teamValidation = validateTeamSelection(formData.home_team_id, formData.away_team_id)
  if (!teamValidation.isValid) {
    if (formData.home_team_id === 0) {
      errors.home_team_id = 'La squadra di casa è obbligatoria'
    }
    if (formData.away_team_id === 0) {
      errors.away_team_id = 'La squadra ospite è obbligatoria'
    }
    if (formData.home_team_id === formData.away_team_id && formData.home_team_id !== 0) {
      errors.home_team_id = 'Le squadre devono essere diverse'
      errors.away_team_id = 'Le squadre devono essere diverse'
    }
  }

  // Validate all score fields
  const scoreFields = [
    { value: formData.home_team_total_score, name: 'Punteggio casa totale', key: 'home_team_total_score' },
    { value: formData.away_team_total_score, name: 'Punteggio ospite totale', key: 'away_team_total_score' },
    {
      value: formData.home_team_first_quarter_score,
      name: 'Punteggio casa 1° quarto',
      key: 'home_team_first_quarter_score',
    },
    {
      value: formData.away_team_first_quarter_score,
      name: 'Punteggio ospite 1° quarto',
      key: 'away_team_first_quarter_score',
    },
    {
      value: formData.home_team_second_quarter_score,
      name: 'Punteggio casa 2° quarto',
      key: 'home_team_second_quarter_score',
    },
    {
      value: formData.away_team_second_quarter_score,
      name: 'Punteggio ospite 2° quarto',
      key: 'away_team_second_quarter_score',
    },
    {
      value: formData.home_team_third_quarter_score,
      name: 'Punteggio casa 3° quarto',
      key: 'home_team_third_quarter_score',
    },
    {
      value: formData.away_team_third_quarter_score,
      name: 'Punteggio ospite 3° quarto',
      key: 'away_team_third_quarter_score',
    },
    {
      value: formData.home_team_fourth_quarter_score,
      name: 'Punteggio casa 4° quarto',
      key: 'home_team_fourth_quarter_score',
    },
    {
      value: formData.away_team_fourth_quarter_score,
      name: 'Punteggio ospite 4° quarto',
      key: 'away_team_fourth_quarter_score',
    },
  ]

  scoreFields.forEach(field => {
    const validation = validateScore(field.value ?? null, field.name)
    if (!validation.isValid) {
      errors[field.key] = validation.error!
    }
  })

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

// Comprehensive game statistics form validation
export const validateGameStatForm = (formData: GameStatFormData, games: any[] = []): ValidationResult => {
  const errors: Record<string, string> = {}

  // Validate team and game selection
  if (!formData.team_id || formData.team_id === 0) {
    errors.team_id = 'La squadra è obbligatoria'
  }

  if (!formData.game_id || formData.game_id === 0) {
    errors.game_id = 'La partita è obbligatoria'
  }

  // Validate team participation in selected game
  if (formData.team_id && formData.game_id && games.length > 0) {
    const selectedGame = games.find(game => game.id === formData.game_id)
    if (
      selectedGame &&
      formData.team_id !== selectedGame.home_team_id &&
      formData.team_id !== selectedGame.away_team_id
    ) {
      errors.team_id = 'La squadra selezionata non ha partecipato alla partita scelta'
    }
  }

  // Validate shooting statistics
  const fieldGoalValidation = validateShootingStats(
    formData.field_goals_made ?? null,
    formData.field_goals_attempted ?? null,
    'Tiri dal campo',
  )
  if (!fieldGoalValidation.isValid) {
    errors.field_goals_made = fieldGoalValidation.error!
    errors.field_goals_attempted = fieldGoalValidation.error!
  }

  const threePointValidation = validateShootingStats(
    formData.three_point_field_goals_made ?? null,
    formData.three_point_field_goals_attempted ?? null,
    'Tiri da 3',
  )
  if (!threePointValidation.isValid) {
    errors.three_point_field_goals_made = threePointValidation.error!
    errors.three_point_field_goals_attempted = threePointValidation.error!
  }

  const twoPointValidation = validateShootingStats(
    formData.two_point_field_goals_made ?? null,
    formData.two_point_field_goals_attempted ?? null,
    'Tiri da 2',
  )
  if (!twoPointValidation.isValid) {
    errors.two_point_field_goals_made = twoPointValidation.error!
    errors.two_point_field_goals_attempted = twoPointValidation.error!
  }

  const freeThrowValidation = validateShootingStats(
    formData.free_throws_made ?? null,
    formData.free_throws_attempted ?? null,
    'Tiri liberi',
  )
  if (!freeThrowValidation.isValid) {
    errors.free_throws_made = freeThrowValidation.error!
    errors.free_throws_attempted = freeThrowValidation.error!
  }

  // Validate rebounds consistency
  const reboundValidation = validateRebounds(
    formData.offensive_rebounds ?? null,
    formData.defensive_rebounds ?? null,
    formData.total_rebounds ?? null,
  )
  if (!reboundValidation.isValid) {
    errors.offensive_rebounds = reboundValidation.error!
    errors.defensive_rebounds = reboundValidation.error!
    errors.total_rebounds = reboundValidation.error!
  }

  // Validate other statistical fields
  const statFields = [
    { value: formData.points, name: 'Punti', key: 'points' },
    { value: formData.assists, name: 'Assist', key: 'assists' },
    { value: formData.turnovers, name: 'Palle perse', key: 'turnovers' },
    { value: formData.steals, name: 'Palle rubate', key: 'steals' },
    { value: formData.blocks, name: 'Stoppate', key: 'blocks' },
    { value: formData.personal_fouls, name: 'Falli personali', key: 'personal_fouls' },
  ]

  statFields.forEach(field => {
    const validation = validateNonNegativeInteger(field.value ?? null, field.name)
    if (!validation.isValid) {
      errors[field.key] = validation.error!
    }
  })

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

// Real-time field validation helpers
export const getFieldValidationClass = (fieldName: string, errors: Record<string, string>): string => {
  if (errors[fieldName]) {
    return 'border-red-500 focus-visible:ring-red-500'
  }
  return ''
}

export const getFieldErrorMessage = (fieldName: string, errors: Record<string, string>): string | undefined => {
  return errors[fieldName]
}

// Utility to check if form has any errors
export const hasFormErrors = (errors: Record<string, string>): boolean => {
  return Object.keys(errors).length > 0
}

// Utility to get first error message
export const getFirstError = (errors: Record<string, string>): string | undefined => {
  const firstKey = Object.keys(errors)[0]
  return firstKey ? errors[firstKey] : undefined
}

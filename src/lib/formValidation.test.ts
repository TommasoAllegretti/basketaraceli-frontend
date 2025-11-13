import { describe, it, expect } from 'vitest'
import { validateGameForm, validateGameStatForm } from '@/lib/formValidation'
import type { GameFormData, GameStatFormData } from '@/lib/formValidation'

describe('formValidation', () => {
  describe('validateGameForm', () => {
    it('should pass validation with valid game data', () => {
      const validGameData: GameFormData = {
        date: '2023-12-25',
        home_team_id: 1,
        away_team_id: 2,
        home_team_total_score: 85,
        away_team_total_score: 78,
      }

      const result = validateGameForm(validGameData)
      expect(result.isValid).toBe(true)
      expect(Object.keys(result.errors)).toHaveLength(0)
    })

    it('should fail validation when teams are the same', () => {
      const invalidGameData: GameFormData = {
        date: '2023-12-25',
        home_team_id: 1,
        away_team_id: 1,
      }

      const result = validateGameForm(invalidGameData)
      expect(result.isValid).toBe(false)
      expect(result.errors.away_team_id).toBeDefined()
    })

    it('should fail validation with empty date', () => {
      const invalidGameData: GameFormData = {
        date: '',
        home_team_id: 1,
        away_team_id: 2,
      }

      const result = validateGameForm(invalidGameData)
      expect(result.isValid).toBe(false)
      expect(result.errors.date).toBeDefined()
    })

    it('should fail validation with negative scores', () => {
      const invalidGameData: GameFormData = {
        date: '2023-12-25',
        home_team_id: 1,
        away_team_id: 2,
        home_team_total_score: -5,
        away_team_total_score: 78,
      }

      const result = validateGameForm(invalidGameData)
      expect(result.isValid).toBe(false)
      expect(result.errors.home_team_total_score).toBeDefined()
    })
  })

  describe('validateGameStatForm', () => {
    it('should pass validation with valid game stat data', () => {
      const validGameStatData: GameStatFormData = {
        team_id: 1,
        game_id: 1,
        points: 85,
        field_goals_attempted: 70,
        field_goals_made: 35,
      }

      const result = validateGameStatForm(validGameStatData)
      expect(result.isValid).toBe(true)
      expect(Object.keys(result.errors)).toHaveLength(0)
    })

    it('should fail validation when field goals made exceeds attempts', () => {
      const invalidGameStatData: GameStatFormData = {
        team_id: 1,
        game_id: 1,
        field_goals_made: 50,
        field_goals_attempted: 40,
      }

      const result = validateGameStatForm(invalidGameStatData)
      expect(result.isValid).toBe(false)
      expect(result.errors.field_goals_made).toBeDefined()
    })

    it('should fail validation with negative values', () => {
      const invalidGameStatData: GameStatFormData = {
        team_id: 1,
        game_id: 1,
        points: -10,
      }

      const result = validateGameStatForm(invalidGameStatData)
      expect(result.isValid).toBe(false)
      expect(result.errors.points).toBeDefined()
    })
  })
})

import type { Team } from './team'

// Forward declaration to avoid circular dependency
export interface GameStatGame {
  id: number
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
  top_scorer_id: number | null
  top_rebounder_id: number | null
  top_assister_id: number | null
  top_efficiency_id: number | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface GameStat {
  id: number
  team_id: number
  game_id: number
  points: number | null
  field_goals_attempted: number | null
  field_goals_made: number | null
  field_goal_percentage: string | null
  three_point_field_goals_made: number | null
  three_point_field_goals_attempted: number | null
  three_point_field_goal_percentage: string | null
  two_point_field_goals_made: number | null
  two_point_field_goals_attempted: number | null
  two_point_field_goal_percentage: string | null
  free_throws_made: number | null
  free_throws_attempted: number | null
  free_throw_percentage: string | null
  offensive_rebounds: number | null
  defensive_rebounds: number | null
  total_rebounds: number | null
  assists: number | null
  turnovers: number | null
  steals: number | null
  blocks: number | null
  personal_fouls: number | null
  performance_index_rating: number | null
  efficiency: number | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  team: Team
  game: GameStatGame
}

// API request/response interfaces for game statistics operations
export interface CreateGameStatData {
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

export type UpdateGameStatData = CreateGameStatData

export interface CreateGameStatResponse {
  success: boolean
  message: string
  data?: GameStat
}

export interface UpdateGameStatResponse {
  success: boolean
  message: string
  data?: GameStat
}

export interface DeleteGameStatResponse {
  success: boolean
  message: string
}

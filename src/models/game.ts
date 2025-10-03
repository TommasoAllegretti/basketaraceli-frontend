import type { Team } from './team'

// Player statistics interface for game details
export interface PlayerStat {
  id: number
  player_id: number
  game_id: number
  seconds_played: number | null
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
  plus_minus: number | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Game {
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
  home_team: Team
  away_team: Team
  stats?: PlayerStat[]
}

// API request/response interfaces for game operations
export interface CreateGameData {
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

export interface UpdateGameData extends CreateGameData {}

export interface CreateGameResponse {
  success: boolean
  message: string
  data?: Game
}

export interface UpdateGameResponse {
  success: boolean
  message: string
  data?: Game
}

export interface DeleteGameResponse {
  success: boolean
  message: string
}

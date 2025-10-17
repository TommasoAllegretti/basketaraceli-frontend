import type { Player } from './player'
import type { Team } from './team'

export interface PlayerStat {
  id: number
  player_id: number
  game_id: number
  seconds_played: number
  points: number
  field_goals_made: number
  field_goals_attempted: number
  field_goal_percentage: number
  three_point_field_goals_made: number
  three_point_field_goals_attempted: number
  three_point_field_goal_percentage: number
  two_point_field_goals_made: number
  two_point_field_goals_attempted: number
  two_point_field_goal_percentage: number
  free_throws_made: number
  free_throws_attempted: number
  free_throw_percentage: number
  offensive_rebounds: number
  defensive_rebounds: number
  total_rebounds: number
  assists: number
  turnovers: number
  steals: number
  blocks: number
  personal_fouls: number
  performance_index_rating: number
  efficiency: number
  plus_minus: number
  created_at: string
  updated_at: string
  deleted_at: string | null
  player?: Player
  team?: Team
  game?: {
    id: number
    date: string
    homeTeam?: {
      id: number
      name: string
      abbreviation: string
    }
    awayTeam?: {
      id: number
      name: string
      abbreviation: string
    }
    home_team?: {
      id: number
      name: string
      abbreviation: string
    }
    away_team?: {
      id: number
      name: string
      abbreviation: string
    }
    home_team_total_score: number | null
    away_team_total_score: number | null
  }
}

export interface PlayerStatsResponse {
  success: boolean
  player: Player
  stats: PlayerStat[]
  totals: {
    games_played: number
    totals: {
      points: number
      field_goals_made: number
      field_goals_attempted: number
      three_point_field_goals_made: number
      three_point_field_goals_attempted: number
      two_point_field_goals_made: number
      two_point_field_goals_attempted: number
      free_throws_made: number
      free_throws_attempted: number
      offensive_rebounds: number
      defensive_rebounds: number
      total_rebounds: number
      assists: number
      turnovers: number
      steals: number
      blocks: number
      personal_fouls: number
      seconds_played: number
    }
    averages: {
      points: number
      total_rebounds: number
      assists: number
      steals: number
      blocks: number
      turnovers: number
      personal_fouls: number
      field_goal_percentage: number
      three_point_field_goal_percentage: number
      two_point_field_goal_percentage: number
      free_throw_percentage: number
      efficiency: number
      performance_index_rating: number
    }
  }
}

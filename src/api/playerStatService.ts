import api from './axios'
import type { PlayerStat } from '../models/playerStat'

export interface RecordActionRequest {
  game_id: number
  player_id: number
  action: string
}

export interface RecordActionResponse {
  success: boolean
  message: string
  player_stat: any
}

export interface UndoActionRequest {
  game_id: number
  player_id: number
  action: string
}

export interface GetPlayerStatsRequest {
  game_id: number
  player_id?: number
}

export interface GetPlayerStatsResponse {
  success: boolean
  stats: any[]
}

export interface InitializePlayerStatsRequest {
  game_id: number
  player_ids: number[]
}

export interface InitializePlayerStatsResponse {
  success: boolean
  message: string
  created_stats: PlayerStat[]
  skipped_stats: Array<{
    player_id: number
    reason: string
  }>
  summary: {
    total_requested: number
    created: number
    skipped: number
  }
}

export interface InitializeSinglePlayerStatRequest {
  game_id: number
  player_id: number
}

export interface InitializeSinglePlayerStatResponse {
  success: boolean
  message: string
  player_stat: PlayerStat
}

/**
 * Record a basketball action for a player in a game
 */
export const recordAction = async (data: RecordActionRequest): Promise<RecordActionResponse> => {
  const response = await api.post('/player-stats/record-action', data)
  return response.data
}

/**
 * Undo the last action for a player in a game
 */
export const undoAction = async (data: UndoActionRequest): Promise<RecordActionResponse> => {
  const response = await api.post('/player-stats/undo-action', data)
  return response.data
}

/**
 * Get player stats for a specific game
 */
export const getPlayerStats = async (params: GetPlayerStatsRequest): Promise<GetPlayerStatsResponse> => {
  const response = await api.get('/player-stats', { params })
  return response.data
}

/**
 * Get detailed player statistics for a specific player
 */
export const getPlayerDetailedStats = async (playerId: number) => {
  const response = await api.get(`/player-stats/player/${playerId}`)
  return response.data
}

/**
 * Initialize PlayerStat entities for multiple players in bulk
 * Creates records with all zero values for players who don't have stats yet
 * Skips players who already have stats for the game
 */
export const initializePlayerStats = async (
  data: InitializePlayerStatsRequest,
): Promise<InitializePlayerStatsResponse> => {
  try {
    const response = await api.post('/player-stats/initialize', data)
    return response.data
  } catch (error: any) {
    // Handle API errors and provide meaningful error messages
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to initialize player statistics')
    }
    throw new Error('Network error occurred while initializing player statistics')
  }
}

/**
 * Initialize PlayerStat entity for a single player
 * Creates a record with all zero values if the player doesn't have stats yet
 * Returns error if player already has stats for the game
 */
export const initializeSinglePlayerStat = async (
  data: InitializeSinglePlayerStatRequest,
): Promise<InitializeSinglePlayerStatResponse> => {
  try {
    const response = await api.post('/player-stats/initialize', data)
    return response.data
  } catch (error: any) {
    // Handle API errors and provide meaningful error messages
    if (error.response?.data) {
      // Handle 409 conflict for existing stats
      if (error.response.status === 409) {
        throw new Error(error.response.data.message || 'Player stats already exist for this game')
      }
      throw new Error(error.response.data.message || 'Failed to initialize player statistics')
    }
    throw new Error('Network error occurred while initializing player statistics')
  }
}

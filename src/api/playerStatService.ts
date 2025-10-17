import api from './axios'

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

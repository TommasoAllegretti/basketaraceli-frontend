import type {
  GameStat,
  CreateGameStatData,
  UpdateGameStatData,
  CreateGameStatResponse,
  UpdateGameStatResponse,
  DeleteGameStatResponse,
} from '@/models/gameStat'
import api from './axios'

export async function getGameStats(): Promise<GameStat[]> {
  try {
    const response = await api.get<GameStat[]>('game-stats', {
      headers: {
        Accept: 'application/json',
      },
    })

    return response.data
  } catch (error: unknown) {
    console.error('Get game stats error')
    throw error
  }
}

export async function getGameStat(id: number): Promise<GameStat> {
  try {
    const response = await api.get<GameStat>(`game-stats/${id}`, {
      headers: {
        Accept: 'application/json',
      },
    })

    return response.data
  } catch (error: unknown) {
    console.error('Get game stat error')
    throw error
  }
}

export async function createGameStat(data: CreateGameStatData): Promise<CreateGameStatResponse> {
  try {
    const response = await api.post<CreateGameStatResponse>('game-stats', data, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })

    return response.data
  } catch (error: unknown) {
    console.error('Create game stat error')
    throw error
  }
}

export async function updateGameStat(id: number, data: UpdateGameStatData): Promise<UpdateGameStatResponse> {
  try {
    const response = await api.put<UpdateGameStatResponse>(`game-stats/${id}`, data, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })

    return response.data
  } catch (error: unknown) {
    console.error('Update game stat error')
    throw error
  }
}

export async function deleteGameStat(id: number): Promise<DeleteGameStatResponse> {
  try {
    const response = await api.delete<DeleteGameStatResponse>(`game-stats/${id}`, {
      headers: {
        Accept: 'application/json',
      },
    })

    return response.data
  } catch (error: unknown) {
    console.error('Delete game stat error')
    throw error
  }
}

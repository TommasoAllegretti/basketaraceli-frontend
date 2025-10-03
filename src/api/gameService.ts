import type {
  Game,
  CreateGameData,
  UpdateGameData,
  CreateGameResponse,
  UpdateGameResponse,
  DeleteGameResponse,
} from '@/models/game'
import api from './axios'

export async function getGames(): Promise<Game[]> {
  try {
    const response = await api.get<Game[]>('games', {
      headers: {
        Accept: 'application/json',
      },
    })

    return response.data
  } catch (error: unknown) {
    console.error('Get games error')
    throw error
  }
}

export async function getGame(id: number): Promise<Game> {
  try {
    const response = await api.get<Game>(`games/${id}`, {
      headers: {
        Accept: 'application/json',
      },
    })

    return response.data
  } catch (error: unknown) {
    console.error('Get game error')
    throw error
  }
}

export async function createGame(data: CreateGameData): Promise<CreateGameResponse> {
  try {
    const response = await api.post<CreateGameResponse>('games', data, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })

    return response.data
  } catch (error: unknown) {
    console.error('Create game error')
    throw error
  }
}

export async function updateGame(id: number, data: UpdateGameData): Promise<UpdateGameResponse> {
  try {
    const response = await api.put<UpdateGameResponse>(`games/${id}`, data, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })

    return response.data
  } catch (error: unknown) {
    console.error('Update game error')
    throw error
  }
}

export async function deleteGame(id: number): Promise<DeleteGameResponse> {
  try {
    const response = await api.delete<DeleteGameResponse>(`games/${id}`, {
      headers: {
        Accept: 'application/json',
      },
    })

    return response.data
  } catch (error: unknown) {
    console.error('Delete game error')
    throw error
  }
}

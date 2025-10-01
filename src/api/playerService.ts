import type { Player } from '@/models/player'
import api from './axios'

export async function getPlayers(): Promise<Player[]> {
  try {
    const response = await api.get<Player[]>('players', {
      headers: {
        Accept: 'application/json',
      },
    })

    return response.data
  } catch (error: unknown) {
    console.error('Get players error')
    throw error
  }
}

export async function getPlayer(id: number): Promise<Player> {
  try {
    const response = await api.get<Player>(`players/${id}`, {
      headers: {
        Accept: 'application/json',
      },
    })

    return response.data
  } catch (error: unknown) {
    console.error('Get player error')
    throw error
  }
}

export interface CreatePlayerData {
  name: string
  position: string
  height_cm: number
  birth_date: string
  jersey_number: number
}

export interface CreatePlayerResponse {
  message: string
  player: Player
}

export async function createPlayer(data: CreatePlayerData): Promise<CreatePlayerResponse> {
  try {
    const response = await api.post<CreatePlayerResponse>('players', data, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })

    return response.data
  } catch (error: unknown) {
    console.error('Create player error')
    throw error
  }
}

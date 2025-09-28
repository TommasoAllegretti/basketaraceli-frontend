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

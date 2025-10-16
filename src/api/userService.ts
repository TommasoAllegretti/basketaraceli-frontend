import type { User } from '@/models/user'
import api from './axios'

export async function getUsers(): Promise<User[]> {
  try {
    const response = await api.get<User[]>('users', {
      headers: {
        Accept: 'application/json',
      },
    })

    return response.data
  } catch (error: unknown) {
    console.error('Get users error')
    throw error
  }
}

export interface LinkUserToPlayerData {
  player_id: number | null
}

export interface LinkUserToPlayerResponse {
  message: string
  user: User
}

export async function linkUserToPlayer(userId: number, data: LinkUserToPlayerData): Promise<LinkUserToPlayerResponse> {
  try {
    const response = await api.put<LinkUserToPlayerResponse>(`users/${userId}/link-player`, data, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })

    return response.data
  } catch (error: unknown) {
    console.error('Link user to player error')
    throw error
  }
}

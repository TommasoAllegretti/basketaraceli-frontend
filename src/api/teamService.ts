import type { Team } from '@/models/team'
import api from './axios'

export async function getTeams(): Promise<Team[]> {
  try {
    const response = await api.get<Team[]>('teams', {
      headers: {
        Accept: 'application/json',
      },
    })

    return response.data
  } catch (error: unknown) {
    console.error('Get teams error')
    throw error
  }
}

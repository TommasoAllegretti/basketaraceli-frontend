import type { League } from '@/models/league'
import api from './axios'

export async function getLeagues(): Promise<League[]> {
  try {
    const response = await api.get<League[]>('leagues', {
      headers: {
        Accept: 'application/json',
      },
    })

    return response.data
  } catch (error: unknown) {
    console.error('Get leagues error')
    throw error
  }
}

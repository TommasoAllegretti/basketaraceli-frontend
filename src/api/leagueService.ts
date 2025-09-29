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

export interface CreateLeagueData {
  name: string
}

export interface CreateLeagueResponse {
  message: string
  league: League
}

export async function createLeague(data: CreateLeagueData): Promise<CreateLeagueResponse> {
  try {
    const response = await api.post<CreateLeagueResponse>('leagues', data, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })

    return response.data
  } catch (error: unknown) {
    console.error('Create league error')
    throw error
  }
}

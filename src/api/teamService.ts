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

export async function getTeam(id: number): Promise<Team> {
  try {
    const response = await api.get<Team>(`teams/${id}`, {
      headers: {
        Accept: 'application/json',
      },
    })

    return response.data
  } catch (error: unknown) {
    console.error('Get team error')
    throw error
  }
}

export interface CreateTeamData {
  abbreviation: string
  league_id?: number
  club_id?: number
}

export interface CreateTeamResponse {
  message: string
  team: Team
}

export async function createTeam(data: CreateTeamData): Promise<CreateTeamResponse> {
  try {
    const response = await api.post<CreateTeamResponse>('teams', data, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })

    return response.data
  } catch (error: unknown) {
    console.error('Create team error')
    throw error
  }
}

export interface UpdateTeamData {
  abbreviation: string
  league_id?: number
  club_id?: number
}

export interface UpdateTeamResponse {
  message: string
  team: Team
}

export async function updateTeam(id: number, data: UpdateTeamData): Promise<UpdateTeamResponse> {
  try {
    const response = await api.put<UpdateTeamResponse>(`teams/${id}`, data, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })

    return response.data
  } catch (error: unknown) {
    console.error('Update team error')
    throw error
  }
}

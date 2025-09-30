import type { Club } from '@/models/club'
import api from './axios'

export async function getClubs(): Promise<Club[]> {
  try {
    const response = await api.get<Club[]>('clubs', {
      headers: {
        Accept: 'application/json',
      },
    })

    return response.data
  } catch (error: unknown) {
    console.error('Get clubs error')
    throw error
  }
}

export async function getClub(id: number): Promise<Club> {
  try {
    const response = await api.get<Club>(`clubs/${id}`, {
      headers: {
        Accept: 'application/json',
      },
    })

    return response.data
  } catch (error: unknown) {
    console.error('Get club error')
    throw error
  }
}

export interface CreateClubData {
  name: string
}

export interface CreateClubResponse {
  message: string
  club: Club
}

export async function createClub(data: CreateClubData): Promise<CreateClubResponse> {
  try {
    const response = await api.post<CreateClubResponse>('clubs', data, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })

    return response.data
  } catch (error: unknown) {
    console.error('Create club error')
    throw error
  }
}

export interface UpdateClubData {
  name: string
}

export interface UpdateClubResponse {
  message: string
  club: Club
}

export async function updateClub(id: number, data: UpdateClubData): Promise<UpdateClubResponse> {
  try {
    const response = await api.put<UpdateClubResponse>(`clubs/${id}`, data, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })

    return response.data
  } catch (error: unknown) {
    console.error('Update club error')
    throw error
  }
}

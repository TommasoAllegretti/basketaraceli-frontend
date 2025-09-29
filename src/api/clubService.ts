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

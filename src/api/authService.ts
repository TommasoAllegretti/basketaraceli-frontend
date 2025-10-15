import type { User } from '@/models/user'
import api from './axios'

interface LoginResponse {
  token: string
  user: User
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  try {
    const response = await api.post<LoginResponse>(
      'login',
      { email, password },
      {
        headers: {
          Accept: 'application/json',
        },
      },
    )
    const { token } = response.data

    sessionStorage.setItem('token', token)

    return response.data
  } catch (error: unknown) {
    console.error('Login error')
    throw error
  }
}

export async function getCurrentUser(): Promise<User> {
  try {
    const response = await api.get<User>('user', {
      headers: {
        Accept: 'application/json',
      },
    })

    return response.data
  } catch (error: unknown) {
    console.error('Get current user error')
    throw error
  }
}

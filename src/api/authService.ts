import type { User } from '@/models/user'
import api from './axios'

interface LoginResponse {
  token: string
  user: User
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  try {
    const response = await api.post<LoginResponse>('/api/login', { email, password })
    const { token } = response.data

    localStorage.setItem('token', token)

    return response.data
  } catch (error: any) {
    console.error('Login error:', error.response?.data || error.message)
    throw error
  }
}

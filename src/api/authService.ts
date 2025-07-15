// authService.ts
import api from './axios'

interface LoginResponse {
  token: string
  user: {
    id: number
    name: string
    email: string
  }
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  try {
    const response = await api.post<LoginResponse>('/login', { email, password })
    const { token } = response.data

    // ✅ Save token in localStorage (or cookies, depending on security requirements)
    localStorage.setItem('token', token)

    return response.data
  } catch (error: any) {
    console.error('Login error:', error.response?.data || error.message)
    throw error
  }
}

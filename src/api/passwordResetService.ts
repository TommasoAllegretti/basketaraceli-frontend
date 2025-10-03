import api from './axios'

export interface ForgotPasswordData {
  email: string
}

export interface ForgotPasswordResponse {
  message: string
}

export interface ResetPasswordData {
  token: string
  email: string
  password: string
  password_confirmation: string
}

export interface ResetPasswordResponse {
  message: string
}

export async function forgotPassword(data: ForgotPasswordData): Promise<ForgotPasswordResponse> {
  try {
    const response = await api.post<ForgotPasswordResponse>('forgot-password', data, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })

    return response.data
  } catch (error: unknown) {
    console.error('Forgot password error')
    throw error
  }
}

export async function resetPassword(data: ResetPasswordData): Promise<ResetPasswordResponse> {
  try {
    const response = await api.post<ResetPasswordResponse>('reset-password', data, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })

    return response.data
  } catch (error: unknown) {
    console.error('Reset password error')
    throw error
  }
}

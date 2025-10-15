import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { useState, useEffect } from 'react'
import { loginSuccess } from '@/store/authSlice'
import { login } from '@/api/authService'
import type { AppDispatch } from '@/store/store'
import { useDispatch } from 'react-redux'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  async function handleLogin(dispatch: AppDispatch, email: string, password: string, refreshUser: () => Promise<void>) {
    const response = await login(email, password)
    sessionStorage.setItem('token', response.token)
    dispatch(loginSuccess({ user: response.user, token: response.token }))
    // Refresh the auth context with user data
    await refreshUser()
  }

  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const location = useLocation()
  const { refreshUser } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [loginError, setLoginError] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Check for success message from password reset
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message)
      // Clear the message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000)
    }
  }, [location.state])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await handleLogin(dispatch, email, password, refreshUser)
      navigate('/')
    } catch (error: unknown) {
      setLoginError(true)
      setTimeout(() => setLoginError(false), 5000)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Accedi al tuo account</CardTitle>
          <CardDescription>Inserisci la tua email per accedere al tuo account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <div className="flex flex-col gap-6">
              {/* Success message from password reset */}
              {successMessage && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-600 text-sm">{successMessage}</p>
                </div>
              )}

              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="utente@esempio.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
                    Password dimenticata?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Accesso in corso...' : 'Accedi'}
                </Button>
                {loginError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm text-center">Credenziali non valide</p>
                  </div>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { useState } from 'react'
import { loginSuccess } from '@/store/authSlice'
import { login } from '@/api/authService'
import type { AppDispatch } from '@/store/store'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  async function handleLogin(dispatch: AppDispatch, email: string, password: string) {
    const response = await login(email, password) // previous login service
    localStorage.setItem('token', response.token)
    dispatch(loginSuccess({ user: response.user, token: response.token }))
  }

  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await handleLogin(dispatch, email, password)
      navigate('/dashboard') // redirect after login
    } catch (error) {
      alert('Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>Enter your email below to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="username@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
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
                <Button type="submit" className="w-full">
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

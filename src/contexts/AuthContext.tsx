import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getCurrentUser } from '@/api/authService'
import type { User } from '@/models/user'

interface AuthContextType {
  user: User | null
  isAdmin: boolean
  loading: boolean
  refreshUser: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        const userData = await getCurrentUser()
        setUser(userData)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      setUser(null)
      // If token is invalid, remove it
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    window.location.href = '/admin/login'
  }

  useEffect(() => {
    refreshUser()
  }, [])

  const isAdmin = user?.admin === 1

  const value: AuthContextType = {
    user,
    isAdmin,
    loading,
    refreshUser,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

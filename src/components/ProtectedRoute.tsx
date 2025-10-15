import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import AppLayout from '@/layout/AppLayout'

interface ProtectedRouteProps {
  children: ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = Boolean(sessionStorage.getItem('token'))

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <AppLayout>{children}</AppLayout>
}

export default ProtectedRoute

import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import type { ReactNode } from 'react'

interface Props {
  allowedRoles: string[]
  children: ReactNode
}

export function ProtectedRoute({ allowedRoles, children }: Props) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user && !allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />

  return <>{children}</>
}

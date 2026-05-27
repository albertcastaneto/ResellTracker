import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../services/authService'
import { isTokenExpired } from '../utils/tokenUtils'
import type { MeResponse } from '../types'

interface AuthContextType {
  user: MeResponse | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]         = useState<MeResponse | null>(null)
  const [isLoading, setLoading] = useState(true)
  const navigate                = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      setLoading(false)
      return
    }
    if (isTokenExpired(token)) {
      localStorage.removeItem('auth_token')
      setLoading(false)
      return
    }
    authService.me()
      .then(res => setUser(res.data))
      .catch(() => localStorage.removeItem('auth_token'))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email: string) => {
    const loginRes = await authService.login(email)
    localStorage.setItem('auth_token', loginRes.data.token)
    const meRes = await authService.me()
    setUser(meRes.data)
    navigate('/dashboard')
  }

  const logout = async () => {
    try { await authService.logout() } catch { /* stateless — ignore */ }
    localStorage.removeItem('auth_token')
    setUser(null)
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

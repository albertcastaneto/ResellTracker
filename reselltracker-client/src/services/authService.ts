import api from './api'
import type { MeResponse } from '../types'

const authService = {
  login: (email: string) =>
    api.post<{ token: string }>('/api/auth/dev-login', { email }),

  me: () =>
    api.get<MeResponse>('/api/auth/me'),

  logout: () =>
    api.post('/api/auth/logout'),
}

export default authService

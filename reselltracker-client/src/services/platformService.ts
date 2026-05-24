import api from './api'
import type { Platform, PlatformRequest } from '../types'

const platformService = {
  getAll: () =>
    api.get<Platform[]>('/api/platforms'),

  getById: (id: string) =>
    api.get<Platform>(`/api/platforms/${id}`),

  create: (data: PlatformRequest) =>
    api.post<Platform>('/api/platforms', data),

  update: (id: string, data: PlatformRequest) =>
    api.put(`/api/platforms/${id}`, data),

  remove: (id: string) =>
    api.delete(`/api/platforms/${id}`),
}

export default platformService

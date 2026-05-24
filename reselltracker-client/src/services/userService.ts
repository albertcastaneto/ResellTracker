import api from './api'
import type { User, UserRequest, UpdateRoleRequest, UpdateStatusRequest } from '../types'

const userService = {
  getAll: () =>
    api.get<User[]>('/api/users'),

  create: (data: UserRequest) =>
    api.post<User>('/api/users', data),

  updateRole: (id: string, data: UpdateRoleRequest) =>
    api.put(`/api/users/${id}/role`, data),

  updateStatus: (id: string, data: UpdateStatusRequest) =>
    api.put(`/api/users/${id}/status`, data),

  remove: (id: string) =>
    api.delete(`/api/users/${id}`),
}

export default userService

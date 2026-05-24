import api from './api'
import type { InventoryItem, InventoryRequest, InventoryFilters } from '../types'

const inventoryService = {
  getAll: (filters?: InventoryFilters) =>
    api.get<InventoryItem[]>('/api/inventory', { params: filters }),

  getById: (id: string) =>
    api.get<InventoryItem>(`/api/inventory/${id}`),

  getActive: () =>
    api.get<InventoryItem[]>('/api/inventory/active'),

  create: (data: InventoryRequest) =>
    api.post<InventoryItem>('/api/inventory', data),

  update: (id: string, data: InventoryRequest) =>
    api.put(`/api/inventory/${id}`, data),

  updateStatus: (id: string, status: string) =>
    api.patch(`/api/inventory/${id}/status`, { status }),

  remove: (id: string) =>
    api.delete(`/api/inventory/${id}`),
}

export default inventoryService

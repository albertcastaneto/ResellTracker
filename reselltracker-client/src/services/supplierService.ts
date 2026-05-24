import api from './api'
import type { Supplier, SupplierRequest } from '../types'

const supplierService = {
  getAll: (isActive?: boolean) =>
    api.get<Supplier[]>('/api/suppliers', {
      params: isActive !== undefined ? { isActive } : {},
    }),

  getById: (id: string) =>
    api.get<Supplier>(`/api/suppliers/${id}`),

  create: (data: SupplierRequest) =>
    api.post<Supplier>('/api/suppliers', data),

  update: (id: string, data: SupplierRequest) =>
    api.put(`/api/suppliers/${id}`, data),

  remove: (id: string) =>
    api.delete(`/api/suppliers/${id}`),
}

export default supplierService

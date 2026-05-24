import api from './api'
import type { SaleLog, SaleLogRequest, SaleLogUpdateRequest, SaleLogFilters, SaleLogPreview } from '../types'

const saleService = {
  getAll: (filters?: SaleLogFilters) =>
    api.get<SaleLog[]>('/api/sales', { params: filters }),

  getById: (id: string) =>
    api.get<SaleLog>(`/api/sales/${id}`),

  create: (data: SaleLogRequest) =>
    api.post<SaleLog>('/api/sales', data),

  update: (id: string, data: SaleLogUpdateRequest) =>
    api.put(`/api/sales/${id}`, data),

  remove: (id: string) =>
    api.delete(`/api/sales/${id}`),

  preview: (inventoryId: string, platformId: string, salePrice: number, postage: number) =>
    api.get<SaleLogPreview>('/api/sales/preview', {
      params: { inventoryId, platformId, salePrice, postage },
    }),
}

export default saleService

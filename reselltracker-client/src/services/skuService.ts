import api from './api'
import type { SkuGenerateRequest, SkuGenerateResponse, SkuRegistry } from '../types'

const skuService = {
  generate: (data: SkuGenerateRequest) =>
    api.post<SkuGenerateResponse>('/api/sku/generate', data),

  getRecent: () =>
    api.get<SkuRegistry[]>('/api/sku/recent'),
}

export default skuService

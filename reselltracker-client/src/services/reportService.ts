import api from './api'
import type {
  Dashboard, CategoryPerformance, SupplierROI,
  SellThrough, AgingStock, MonthlyRevenue,
} from '../types'

const reportService = {
  getDashboard:           () => api.get<Dashboard>('/api/reports/dashboard'),
  getCategoryPerformance: () => api.get<CategoryPerformance[]>('/api/reports/category-performance'),
  getSupplierROI:         () => api.get<SupplierROI[]>('/api/reports/supplier-roi'),
  getSellThrough:         () => api.get<SellThrough[]>('/api/reports/sell-through'),
  getAgingStock:          () => api.get<AgingStock[]>('/api/reports/aging-stock'),
  getMonthlyRevenue:      (months: number) =>
    api.get<MonthlyRevenue[]>('/api/reports/monthly-revenue', { params: { months } }),
}

export default reportService

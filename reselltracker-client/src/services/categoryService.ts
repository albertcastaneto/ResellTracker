import api from './api'
import type { Category } from '../types'

const categoryService = {
  getAll: () => api.get<Category[]>('/api/categories'),
}

export default categoryService

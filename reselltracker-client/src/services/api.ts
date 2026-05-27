import axios from 'axios'
import { isTokenExpired } from '../utils/tokenUtils'
import { globalShow } from '../utils/globalToast'
import { validateEnv } from '../utils/envUtils'

validateEnv()

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    if (isTokenExpired(token)) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
      return Promise.reject(new Error('Token expired'))
    }
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status
      if (status === 401) {
        localStorage.removeItem('auth_token')
        window.location.href = '/login'
      } else if (status === 429) {
        globalShow('Too many requests. Please slow down.', 'warning')
      } else if (status === 403) {
        globalShow("You don't have permission to do that.", 'error')
      } else if (status >= 500) {
        globalShow('Something went wrong. Please try again.', 'error')
      }
    } else if (error.request) {
      globalShow('Cannot connect to server.', 'error')
    }
    return Promise.reject(error)
  }
)

export default api

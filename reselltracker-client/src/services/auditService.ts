import api from './api'
import type { AuditLogPage, AuditLogEntry } from '../types'

const auditService = {
  getAll: (pageNumber = 1, pageSize = 50) =>
    api.get<AuditLogPage>('/api/audit', { params: { pageNumber, pageSize } }),

  getByEntity: (entityName: string, entityId: string) =>
    api.get<AuditLogEntry[]>(`/api/audit/entity/${entityName}/${entityId}`),

  getByUser: (email: string) =>
    api.get<AuditLogEntry[]>(`/api/audit/user/${encodeURIComponent(email)}`),

  getByDateRange: (from: string, to: string) =>
    api.get<AuditLogEntry[]>('/api/audit/daterange', { params: { from, to } }),
}

export default auditService

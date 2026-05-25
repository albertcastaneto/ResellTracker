import { useEffect, useState, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import auditService from '../services/auditService'
import type { AuditLogEntry } from '../types'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { useToast } from '../components/ui/Toast'

const PAGE_SIZE = 50

const ACTION_STYLES: Record<string, string> = {
  Created: 'bg-green-100 text-green-800',
  Updated: 'bg-blue-100 text-blue-700',
  Deleted: 'bg-red-100 text-red-700',
  Login:   'bg-gray-100 text-gray-600',
}

function ActionBadge({ action }: { action: string }) {
  const key = Object.keys(ACTION_STYLES).find(k => action.includes(k)) ?? ''
  const cls = ACTION_STYLES[key] ?? 'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
      {action}
    </span>
  )
}

function JsonBlock({ label, value }: { label: string; value: string | null }) {
  if (!value) return null
  let pretty = value
  try { pretty = JSON.stringify(JSON.parse(value), null, 2) } catch { /* leave as-is */ }
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 mb-1">{label}</p>
      <pre className="bg-gray-50 border border-gray-200 rounded p-3 text-xs overflow-auto max-h-48 whitespace-pre-wrap break-all">{pretty}</pre>
    </div>
  )
}

export default function AuditLog() {
  const { show }   = useToast()
  const [items, setItems]           = useState<AuditLogEntry[]>([])
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [loading, setLoading]       = useState(true)
  const [selected, setSelected]     = useState<AuditLogEntry | null>(null)

  const [search, setSearch]         = useState('')
  const [entityFilter, setEntityFilter] = useState('')
  const [fromDate, setFromDate]     = useState('')
  const [toDate, setToDate]         = useState('')

  const load = useCallback((p: number) => {
    setLoading(true)
    auditService.getAll(p, PAGE_SIZE)
      .then(r => {
        setItems(r.data.items)
        setTotal(r.data.totalCount)
      })
      .catch(() => show('Failed to load audit log', 'error'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load(1) }, [load])

  const handlePageChange = (p: number) => {
    setPage(p)
    load(p)
  }

  const hasFilters = search || entityFilter || fromDate || toDate
  const clearFilters = () => { setSearch(''); setEntityFilter(''); setFromDate(''); setToDate('') }

  // Client-side filter on loaded page
  const filtered = items.filter(e => {
    if (search && !e.userEmail.toLowerCase().includes(search.toLowerCase()) &&
        !e.entityId.toLowerCase().includes(search.toLowerCase()) &&
        !e.action.toLowerCase().includes(search.toLowerCase())) return false
    if (entityFilter && !e.entityName.toLowerCase().includes(entityFilter.toLowerCase())) return false
    if (fromDate && e.createdAt < fromDate) return false
    if (toDate && e.createdAt > toDate + 'T23:59:59') return false
    return true
  })

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Audit Log</h2>
          <p className="text-sm text-gray-500 mt-0.5">All system activity and changes</p>
        </div>
        {total > 0 && (
          <span className="text-xs text-gray-400">{total.toLocaleString()} total entries</span>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 flex flex-wrap gap-3 items-end">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search user, action, entity ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-700 focus:border-green-700"
          />
        </div>
        <input
          type="text"
          placeholder="Entity type…"
          value={entityFilter}
          onChange={e => setEntityFilter(e.target.value)}
          className="w-36 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-700 focus:border-green-700"
        />
        <input
          type="date"
          value={fromDate}
          onChange={e => setFromDate(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-700 focus:border-green-700"
        />
        <span className="text-xs text-gray-400">to</span>
        <input
          type="date"
          value={toDate}
          onChange={e => setToDate(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-700 focus:border-green-700"
        />
        {hasFilters && (
          <Button variant="secondary" size="sm" onClick={clearFilters}>
            <X className="h-3.5 w-3.5 mr-1" /> Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">No audit entries found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Timestamp</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Entity</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Entity ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">IP</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(entry => (
                  <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-gray-500 tabular-nums whitespace-nowrap">
                      {new Date(entry.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-700 text-xs">{entry.userEmail}</td>
                    <td className="px-4 py-3"><ActionBadge action={entry.action} /></td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{entry.entityName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 max-w-[120px] truncate" title={entry.entityId}>
                      {entry.entityId}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{entry.ipAddress ?? '—'}</td>
                    <td className="px-4 py-3">
                      {(entry.oldValues || entry.newValues) && (
                        <button
                          onClick={() => setSelected(entry)}
                          className="text-xs text-green-800 hover:text-green-900 font-medium"
                        >
                          Details
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <Button
                variant="secondary" size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
              >
                Prev
              </Button>
              <Button
                variant="secondary" size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Audit Entry Details">
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">Action</p>
                <ActionBadge action={selected.action} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Entity</p>
                <p className="font-medium text-gray-800">{selected.entityName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">User</p>
                <p className="text-gray-700">{selected.userEmail}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Timestamp</p>
                <p className="text-gray-700 tabular-nums text-xs">{new Date(selected.createdAt).toLocaleString()}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500">Entity ID</p>
                <p className="font-mono text-xs text-gray-600 break-all">{selected.entityId}</p>
              </div>
              {selected.ipAddress && (
                <div>
                  <p className="text-xs text-gray-500">IP Address</p>
                  <p className="font-mono text-xs text-gray-600">{selected.ipAddress}</p>
                </div>
              )}
            </div>
            <JsonBlock label="Old Values" value={selected.oldValues} />
            <JsonBlock label="New Values" value={selected.newValues} />
            <div className="flex justify-end mt-2">
              <Button variant="secondary" onClick={() => setSelected(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

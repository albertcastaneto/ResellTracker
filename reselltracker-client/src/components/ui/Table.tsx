import { useState } from 'react'

export interface Column<T> {
  key: string
  header: string
  sortable?: boolean
  render?: (row: T) => React.ReactNode
}

interface Props<T> {
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  rowKey: (row: T) => string
  emptyMessage?: string
}

export function Table<T>({ columns, data, isLoading, rowKey, emptyMessage = 'No data found.' }: Props<T>) {
  const [sortKey, setSortKey]   = useState<string | null>(null)
  const [sortAsc, setSortAsc]   = useState(true)

  const handleSort = (key: string) => {
    if (sortKey === key) setSortAsc(a => !a)
    else { setSortKey(key); setSortAsc(true) }
  }

  const sorted = [...data].sort((a, b) => {
    if (!sortKey) return 0
    const av = (a as Record<string, unknown>)[sortKey]
    const bv = (b as Record<string, unknown>)[sortKey]
    if (av === bv) return 0
    const cmp = av! < bv! ? -1 : 1
    return sortAsc ? cmp : -cmp
  })

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider
                  ${col.sortable ? 'cursor-pointer select-none hover:text-gray-700' : ''}`}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                <span className="inline-flex items-center gap-1">
                  {col.header}
                  {col.sortable && sortKey === col.key && (
                    <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
                      {sortAsc
                        ? <path d="M6 2l4 6H2l4-6z" />
                        : <path d="M6 10L2 4h8L6 10z" />}
                    </svg>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                  </td>
                ))}
              </tr>
            ))
            : sorted.length === 0
              ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-10 text-center text-gray-400">
                    {emptyMessage}
                  </td>
                </tr>
              )
              : sorted.map((row, i) => (
                <tr key={rowKey(row)} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3 text-gray-700">
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
          }
        </tbody>
      </table>
    </div>
  )
}

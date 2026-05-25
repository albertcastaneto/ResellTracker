import { useEffect, useState } from 'react'
import reportService from '../services/reportService'
import type { CategoryPerformance } from '../types'
import { useToast } from '../components/ui/Toast'

type SortKey = keyof CategoryPerformance
type SortDir = 'asc' | 'desc'

function fmt(n: number) { return `$${n.toFixed(2)}` }
function fmtK(n: number) { return n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toFixed(2)}` }

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="text-gray-300 ml-1">↕</span>
  return <span className="text-green-800 ml-1">{dir === 'asc' ? '↑' : '↓'}</span>
}

function ProgressBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value))
  const color = pct >= 70 ? 'bg-green-600' : pct >= 40 ? 'bg-amber-400' : 'bg-red-400'
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-600 tabular-nums">{pct.toFixed(1)}%</span>
    </div>
  )
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">1</span>
  if (rank === 2) return <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-xs font-bold">2</span>
  if (rank === 3) return <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-bold">3</span>
  return <span className="text-xs text-gray-400 tabular-nums">{rank}</span>
}

export default function CategoryPerformancePage() {
  const { show } = useToast()
  const [data, setData]       = useState<CategoryPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>('totalProfit')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  useEffect(() => {
    reportService.getCategoryPerformance()
      .then(r => setData(r.data))
      .catch(() => show('Failed to load category performance', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sorted = [...data].sort((a, b) => {
    const av = a[sortKey] as number | string
    const bv = b[sortKey] as number | string
    const cmp = av < bv ? -1 : av > bv ? 1 : 0
    return sortDir === 'asc' ? cmp : -cmp
  })

  const Th = ({ label, k }: { label: string; k: SortKey }) => (
    <th
      onClick={() => handleSort(k)}
      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer select-none whitespace-nowrap hover:text-gray-700"
    >
      {label}<SortIcon active={sortKey === k} dir={sortDir} />
    </th>
  )

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Category Performance</h2>
        <p className="text-sm text-gray-500 mt-0.5">Revenue and profit breakdown by category</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400">Loading…</div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">No category data available.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-10">#</th>
                  <Th label="Category"      k="categoryName" />
                  <Th label="Listed"        k="totalListed" />
                  <Th label="Sold"          k="totalSold" />
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Sell-through</th>
                  <Th label="Avg COGS"      k="avgCogs" />
                  <Th label="Avg Sale"      k="avgSalePrice" />
                  <Th label="Avg Profit"    k="avgNetProfit" />
                  <Th label="Total Rev."    k="totalRevenue" />
                  <Th label="Total Profit"  k="totalProfit" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sorted.map((row, i) => (
                  <tr key={row.categoryName} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <RankBadge rank={i + 1} />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{row.categoryName}</td>
                    <td className="px-4 py-3 text-gray-600 tabular-nums">{row.totalListed}</td>
                    <td className="px-4 py-3 text-gray-600 tabular-nums">{row.totalSold}</td>
                    <td className="px-4 py-3">
                      <ProgressBar value={row.sellThroughRate} />
                    </td>
                    <td className="px-4 py-3 text-gray-600 tabular-nums">{fmt(row.avgCogs)}</td>
                    <td className="px-4 py-3 text-gray-600 tabular-nums">{fmt(row.avgSalePrice)}</td>
                    <td className={`px-4 py-3 tabular-nums font-medium ${row.avgNetProfit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                      {fmt(row.avgNetProfit)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 tabular-nums">{fmtK(row.totalRevenue)}</td>
                    <td className={`px-4 py-3 tabular-nums font-semibold ${row.totalProfit >= 0 ? 'text-green-800' : 'text-red-600'}`}>
                      {fmtK(row.totalProfit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && data.length > 0 && (
        <p className="text-xs text-gray-400 mt-2">{data.length} categories · click column headers to sort</p>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import reportService from '../services/reportService'
import type { SellThrough, AgingStock } from '../types'
import { useToast } from '../components/ui/Toast'
import { Select } from '../components/ui/Select'
import { SellThroughBarChart } from '../components/charts/SellThroughBarChart'

const AGE_BANDS = ['All', 'Fresh', 'Aging', 'Stale', 'DeadStock'] as const
type AgeBandFilter = typeof AGE_BANDS[number]

const BAND_STYLES: Record<string, string> = {
  Fresh:     'bg-green-100 text-green-800',
  Aging:     'bg-amber-100 text-amber-700',
  Stale:     'bg-orange-100 text-orange-700',
  DeadStock: 'bg-red-100 text-red-700',
}

function BandBadge({ band }: { band: string }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${BAND_STYLES[band] ?? 'bg-gray-100 text-gray-600'}`}>
      {band}
    </span>
  )
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function SellThroughPage() {
  const { show } = useToast()
  const [sellThrough, setSellThrough] = useState<SellThrough[]>([])
  const [aging, setAging]             = useState<AgingStock[]>([])
  const [loading, setLoading]         = useState(true)
  const [agingLoading, setAgingLoading] = useState(true)
  const [bandFilter, setBandFilter]   = useState<AgeBandFilter>('All')

  useEffect(() => {
    reportService.getSellThrough()
      .then(r => setSellThrough(r.data))
      .catch(() => show('Failed to load sell-through data', 'error'))
      .finally(() => setLoading(false))

    reportService.getAgingStock()
      .then(r => setAging(r.data))
      .catch(() => show('Failed to load aging stock', 'error'))
      .finally(() => setAgingLoading(false))
  }, [])

  const overall     = sellThrough.find(s => s.isOverall)
  const categories  = sellThrough.filter(s => !s.isOverall)
  const filteredAging = bandFilter === 'All' ? aging : aging.filter(a => a.ageBand === bandFilter)

  const bandCounts = AGE_BANDS.slice(1).reduce<Record<string, number>>((acc, b) => {
    acc[b] = aging.filter(a => a.ageBand === b).length
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Sell Through</h2>
        <p className="text-sm text-gray-500 mt-0.5">Sell-through rates and inventory aging analysis</p>
      </div>

      {/* Overall metrics */}
      {!loading && overall && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="Overall Sell-through"
            value={`${overall.sellThroughRate.toFixed(1)}%`}
            sub={`${overall.totalSold} of ${overall.totalListed} items`}
          />
          <MetricCard
            label="Avg Days to Sell"
            value={`${overall.avgDaysToSell.toFixed(0)}`}
            sub="across all categories"
          />
          <MetricCard label="Total Listed"  value={String(overall.totalListed)} />
          <MetricCard label="Total Sold"    value={String(overall.totalSold)} />
        </div>
      )}

      {/* Category chart */}
      {!loading && categories.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Sell-through Rate by Category</h3>
          <SellThroughBarChart data={sellThrough} />
        </div>
      )}

      {/* Category table */}
      {!loading && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">Category Breakdown</h3>
          </div>
          {categories.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">No data available.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Listed</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Sold</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Sell-through</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Avg Days to Sell</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[...categories]
                    .sort((a, b) => b.sellThroughRate - a.sellThroughRate)
                    .map(row => {
                      const pct = Math.min(100, Math.max(0, row.sellThroughRate))
                      const color = pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-amber-400' : 'bg-red-400'
                      return (
                        <tr key={row.categoryName} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{row.categoryName}</td>
                          <td className="px-4 py-3 text-right text-gray-600 tabular-nums">{row.totalListed}</td>
                          <td className="px-4 py-3 text-right text-gray-600 tabular-nums">{row.totalSold}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-xs tabular-nums text-gray-600">{pct.toFixed(1)}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-600 tabular-nums">
                            {row.avgDaysToSell > 0 ? row.avgDaysToSell.toFixed(0) : '—'}
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Aging Stock */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center gap-3 justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-700">Aging Stock</h3>
            <div className="flex gap-3 mt-1 text-xs text-gray-400">
              {AGE_BANDS.slice(1).map(b => (
                <span key={b}><span className={`font-medium ${b === 'Fresh' ? 'text-green-700' : b === 'Aging' ? 'text-amber-600' : b === 'Stale' ? 'text-orange-600' : 'text-red-600'}`}>{bandCounts[b] ?? 0}</span> {b}</span>
              ))}
            </div>
          </div>
          <div className="w-40">
            <Select
              options={AGE_BANDS.map(b => ({ value: b, label: b === 'All' ? 'All Bands' : b }))}
              value={bandFilter}
              onChange={e => setBandFilter(e.target.value as AgeBandFilter)}
            />
          </div>
        </div>

        {agingLoading ? (
          <div className="p-8 text-center text-sm text-gray-400">Loading…</div>
        ) : filteredAging.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">No items match this filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Brand</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Supplier</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Listed</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Days</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Band</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[...filteredAging]
                  .sort((a, b) => b.daysListed - a.daysListed)
                  .map(item => (
                    <tr key={item.sku} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-green-800 font-medium">{item.sku}</td>
                      <td className="px-4 py-3 text-gray-700">{item.brand}</td>
                      <td className="px-4 py-3 text-gray-600">{item.categoryName}</td>
                      <td className="px-4 py-3 text-gray-500">{item.supplierName ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{item.dateListed}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium text-gray-700">{item.daysListed}</td>
                      <td className="px-4 py-3"><BandBadge band={item.ageBand} /></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

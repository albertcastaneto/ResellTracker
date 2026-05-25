import { useEffect, useState } from 'react'
import {
  Package, DollarSign, TrendingUp, ShoppingCart,
  BarChart2, Wallet, Tag, Award,
} from 'lucide-react'
import reportService from '../services/reportService'
import type { Dashboard, CategoryPerformance, SupplierROI, SellThrough, MonthlyRevenue } from '../types'
import { RevenueBarChart } from '../components/charts/RevenueBarChart'
import { CategoryDonutChart } from '../components/charts/CategoryDonutChart'
import { SellThroughBarChart } from '../components/charts/SellThroughBarChart'
import { SupplierROIBarChart } from '../components/charts/SupplierROIBarChart'
import { useToast } from '../components/ui/Toast'

function fmt(n: number) { return `$${n.toFixed(2)}` }
function fmtK(n: number) { return n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toFixed(2)}` }
function fmtPct(n: number) { return `${n.toFixed(1)}%` }

interface KpiCardProps {
  label: string
  value: string
  sub?: string
  Icon: React.ComponentType<{ className?: string }>
  accent?: string
}

function KpiCard({ label, value, sub, Icon, accent = 'bg-green-50 text-green-800' }: KpiCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-start gap-3">
      <div className={`p-2 rounded-md ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 truncate">{label}</p>
        <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

interface ChartCardProps {
  title: string
  children: React.ReactNode
}

function ChartCard({ title, children }: ChartCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      {children}
    </div>
  )
}

function Skeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-lg h-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-lg h-64" />
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { show } = useToast()
  const [kpi, setKpi]           = useState<Dashboard | null>(null)
  const [categories, setCategories] = useState<CategoryPerformance[]>([])
  const [suppliers, setSuppliers]   = useState<SupplierROI[]>([])
  const [sellThrough, setSellThrough] = useState<SellThrough[]>([])
  const [revenue, setRevenue]       = useState<MonthlyRevenue[]>([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    Promise.all([
      reportService.getDashboard(),
      reportService.getCategoryPerformance(),
      reportService.getSupplierROI(),
      reportService.getSellThrough(),
      reportService.getMonthlyRevenue(12),
    ])
      .then(([d, c, s, st, r]) => {
        setKpi(d.data)
        setCategories(c.data)
        setSuppliers(s.data)
        setSellThrough(st.data)
        setRevenue(r.data)
      })
      .catch(() => show('Failed to load dashboard data', 'error'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Skeleton />

  const topCat  = [...categories].sort((a, b) => b.totalProfit - a.totalProfit)[0]
  const worstCat = [...categories].filter(c => c.totalSold > 0).sort((a, b) => a.avgNetProfit - b.avgNetProfit)[0]
  const overall  = sellThrough.find(s => s.isOverall)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-500 mt-0.5">Business overview and key metrics</p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Active Listings"    value={String(kpi?.totalActiveListings ?? 0)} Icon={Package} />
        <KpiCard label="Inventory Value"    value={fmtK(kpi?.totalInventoryValue ?? 0)}   Icon={DollarSign} />
        <KpiCard label="Cash in Stock"      value={fmtK(kpi?.cashTiedInStock ?? 0)}       Icon={Wallet} />
        <KpiCard label="Monthly Revenue"    value={fmtK(kpi?.monthlyRevenue ?? 0)}        Icon={BarChart2} />
        <KpiCard label="Monthly Profit"     value={fmtK(kpi?.monthlyProfit ?? 0)}         Icon={TrendingUp} />
        <KpiCard label="Sell-through Rate"  value={fmtPct(kpi?.sellThroughRate ?? 0)}     Icon={Tag} />
        <KpiCard label="Total Items Sold"   value={String(kpi?.totalItemsSold ?? 0)}      Icon={ShoppingCart} />
        <KpiCard label="Avg Net Profit"     value={fmt(kpi?.avgNetProfit ?? 0)}            Icon={Award} />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ChartCard title="Monthly Revenue & Profit (12 months)">
            <RevenueBarChart data={revenue} />
          </ChartCard>
        </div>
        <ChartCard title="Revenue by Category">
          <CategoryDonutChart data={categories} />
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Sell-through Rate by Category">
          <SellThroughBarChart data={sellThrough} />
        </ChartCard>
        <ChartCard title="Top 5 Suppliers by ROI">
          <SupplierROIBarChart data={suppliers} />
        </ChartCard>
      </div>

      {/* Callout cards */}
      {(topCat || worstCat || overall) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topCat && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">Top Category</p>
              <p className="text-lg font-bold text-green-900">{topCat.categoryName}</p>
              <p className="text-sm text-green-700 mt-1">{fmtK(topCat.totalProfit)} total profit</p>
              <p className="text-xs text-green-600 mt-0.5">{topCat.totalSold} sold · {fmtPct(topCat.sellThroughRate)} sell-through</p>
            </div>
          )}
          {worstCat && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Lowest Avg Profit</p>
              <p className="text-lg font-bold text-amber-900">{worstCat.categoryName}</p>
              <p className="text-sm text-amber-700 mt-1">{fmt(worstCat.avgNetProfit)} avg profit</p>
              <p className="text-xs text-amber-600 mt-0.5">{worstCat.totalSold} sold · {fmtPct(worstCat.sellThroughRate)} sell-through</p>
            </div>
          )}
          {overall && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Overall Sell-through</p>
              <p className="text-3xl font-bold text-blue-900">{fmtPct(overall.sellThroughRate)}</p>
              <p className="text-sm text-blue-700 mt-1">{overall.totalSold} sold of {overall.totalListed} listed</p>
              <p className="text-xs text-blue-600 mt-0.5">{overall.avgDaysToSell.toFixed(0)} avg days to sell</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

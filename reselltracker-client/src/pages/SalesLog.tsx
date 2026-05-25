import { useEffect, useState } from 'react'
import {
  Plus, Receipt, DollarSign, TrendingUp, BarChart2,
  Pencil, Trash2, ChevronLeft, ChevronRight,
} from 'lucide-react'
import saleService      from '../services/saleService'
import platformService  from '../services/platformService'
import categoryService  from '../services/categoryService'
import inventoryService from '../services/inventoryService'
import type { SaleLog, Platform, Category, InventoryItem, SaleLogPreview } from '../types'
import { Button }        from '../components/ui/Button'
import { Input }         from '../components/ui/Input'
import { Select }        from '../components/ui/Select'
import { Modal }         from '../components/ui/Modal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { useToast }      from '../components/ui/Toast'
import { useRbac }       from '../context/RbacContext'

const PAGE_SIZE = 25

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function fmt(n: number) {
  return `$${n.toFixed(2)}`
}

function profitClass(n: number) {
  if (n > 0) return 'text-emerald-600 bg-emerald-50'
  if (n < 0) return 'text-red-600 bg-red-50'
  return 'text-gray-600'
}

function daysClass(d: number) {
  if (d <= 7)  return 'text-emerald-600'
  if (d <= 30) return 'text-gray-600'
  if (d <= 60) return 'text-amber-600'
  return 'text-red-600'
}

interface StatCardProps { icon: React.ReactNode; label: string; value: string }
function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex items-center gap-4">
      <div className="p-2.5 bg-green-50 rounded-lg text-green-800">{icon}</div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-xl font-semibold text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  )
}

interface PreviewPanelProps {
  preview: SaleLogPreview | null
  salePrice: string
  postage: string
  loading?: boolean
}
function PreviewPanel({ preview, salePrice, postage, loading }: PreviewPanelProps) {
  if (!preview && !loading) return null
  if (loading) {
    return (
      <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3 mb-3" />
        <div className="space-y-2">
          {[1,2,3,4].map(i => <div key={i} className="h-3 bg-gray-200 rounded animate-pulse" />)}
        </div>
      </div>
    )
  }
  if (!preview) return null
  const sp     = parseFloat(salePrice) || 0
  const po     = parseFloat(postage)   || 0
  const fee    = (sp * preview.feePercentage / 100) + preview.fixedFee
  const profit = preview.estimatedNetProfit
  return (
    <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Profit Preview</p>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Sale Price</span>
          <span className="text-gray-900">{fmt(sp)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Cost Price</span>
          <span className="text-gray-900">-{fmt(preview.cogs)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">
            Platform Fee ({preview.feePercentage}% + {fmt(preview.fixedFee)} fixed)
          </span>
          <span className="text-gray-900">-{fmt(fee)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Postage</span>
          <span className="text-gray-900">-{fmt(po)}</span>
        </div>
        <div className="h-px bg-gray-200 my-1" />
        <div className="flex justify-between font-semibold">
          <span className="text-gray-900">Net Profit</span>
          <span className={profit >= 0 ? 'text-emerald-600' : 'text-red-600'}>{fmt(profit)}</span>
        </div>
      </div>
    </div>
  )
}

export default function SalesLog() {
  const { show }      = useToast()
  const { canDelete } = useRbac()

  const [all, setAll]                 = useState<SaleLog[]>([])
  const [platforms, setPlatforms]     = useState<Platform[]>([])
  const [categories, setCategories]   = useState<Category[]>([])
  const [activeItems, setActiveItems] = useState<InventoryItem[]>([])
  const [loading, setLoading]         = useState(true)
  const [page, setPage]               = useState(1)

  // Filters
  const [fPlatform, setFPlatform] = useState('')
  const [fCategory, setFCategory] = useState('')
  const [fFrom, setFFrom]         = useState('')
  const [fTo, setFTo]             = useState('')

  // Log Sale modal
  const [showLog, setShowLog]               = useState(false)
  const [logStep, setLogStep]               = useState<1 | 2>(1)
  const [logItem, setLogItem]               = useState<InventoryItem | null>(null)
  const [itemSearch, setItemSearch]         = useState('')
  const [logPlatformId, setLogPlatformId]   = useState('')
  const [logSalePrice, setLogSalePrice]     = useState('')
  const [logPostage, setLogPostage]         = useState('')
  const [logDateSold, setLogDateSold]       = useState(todayStr())
  const [logPreview, setLogPreview]         = useState<SaleLogPreview | null>(null)
  const [logPreviewLoad, setLogPreviewLoad] = useState(false)
  const [logSubmitting, setLogSubmitting]   = useState(false)

  // Edit modal
  const [editSale, setEditSale]               = useState<SaleLog | null>(null)
  const [editSalePrice, setEditSalePrice]     = useState('')
  const [editPostage, setEditPostage]         = useState('')
  const [editDateSold, setEditDateSold]       = useState('')
  const [editPreview, setEditPreview]         = useState<SaleLogPreview | null>(null)
  const [editPreviewLoad, setEditPreviewLoad] = useState(false)
  const [editSubmitting, setEditSubmitting]   = useState(false)

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<SaleLog | null>(null)

  // ── Load reference data ───────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([saleService.getAll(), platformService.getAll(), categoryService.getAll()])
      .then(([sales, plats, cats]) => {
        setAll(sales.data)
        setPlatforms(plats.data)
        setCategories(cats.data)
      })
      .catch(() => show('Failed to load data', 'error'))
      .finally(() => setLoading(false))
  }, [])

  // ── Auto-fill postage when platform selected ──────────────────────────────
  useEffect(() => {
    const p = platforms.find(p => p.id === logPlatformId)
    if (p) setLogPostage(p.defaultPostage.toFixed(2))
  }, [logPlatformId, platforms])

  // ── Live preview — log modal ──────────────────────────────────────────────
  useEffect(() => {
    if (!logItem || !logPlatformId || !logSalePrice) { setLogPreview(null); return }
    setLogPreviewLoad(true)
    const tid = setTimeout(async () => {
      try {
        const res = await saleService.preview(
          logItem.id, logPlatformId,
          parseFloat(logSalePrice) || 0,
          parseFloat(logPostage)   || 0,
        )
        setLogPreview(res.data)
      } catch { /* ignore */ }
      finally  { setLogPreviewLoad(false) }
    }, 500)
    return () => clearTimeout(tid)
  }, [logItem, logPlatformId, logSalePrice, logPostage])

  // ── Live preview — edit modal ─────────────────────────────────────────────
  useEffect(() => {
    if (!editSale || !editSalePrice) { setEditPreview(null); return }
    setEditPreviewLoad(true)
    const tid = setTimeout(async () => {
      try {
        const res = await saleService.preview(
          editSale.inventoryId, editSale.platformId,
          parseFloat(editSalePrice) || 0,
          parseFloat(editPostage)   || 0,
        )
        setEditPreview(res.data)
      } catch { /* ignore */ }
      finally  { setEditPreviewLoad(false) }
    }, 500)
    return () => clearTimeout(tid)
  }, [editSale, editSalePrice, editPostage])

  // ── Helpers ───────────────────────────────────────────────────────────────
  async function reloadSales() {
    const res = await saleService.getAll()
    setAll(res.data)
  }

  function openLogModal() {
    inventoryService.getActive().then(r => setActiveItems(r.data)).catch(() => {})
    setLogStep(1); setLogItem(null); setItemSearch('')
    setLogPlatformId(''); setLogSalePrice(''); setLogPostage('')
    setLogDateSold(todayStr()); setLogPreview(null)
    setShowLog(true)
  }

  async function handleLogSale() {
    if (!logItem || !logPlatformId || !logSalePrice) {
      show('Please fill in all fields', 'warning'); return
    }
    setLogSubmitting(true)
    try {
      await saleService.create({
        inventoryId: logItem.id,
        platformId:  logPlatformId,
        salePrice:   parseFloat(logSalePrice),
        postage:     parseFloat(logPostage) || 0,
        dateSold:    logDateSold,
      })
      show('Sale logged successfully', 'success')
      setShowLog(false)
      await reloadSales()
      setPage(1)
    } catch {
      show('Failed to log sale', 'error')
    } finally {
      setLogSubmitting(false)
    }
  }

  function openEdit(s: SaleLog) {
    setEditSale(s)
    setEditSalePrice(s.salePrice.toFixed(2))
    setEditPostage(s.postage.toFixed(2))
    setEditDateSold(s.dateSold)
    setEditPreview(null)
  }

  async function handleEditSave() {
    if (!editSale || !editSalePrice) { show('Fill in all fields', 'warning'); return }
    setEditSubmitting(true)
    try {
      await saleService.update(editSale.id, {
        salePrice: parseFloat(editSalePrice),
        postage:   parseFloat(editPostage) || 0,
        dateSold:  editDateSold,
      })
      show('Sale updated', 'success')
      setEditSale(null)
      await reloadSales()
    } catch {
      show('Failed to update sale', 'error')
    } finally {
      setEditSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await saleService.remove(deleteTarget.id)
      show('Sale deleted — inventory item restored to Active', 'success')
      setDeleteTarget(null)
      await reloadSales()
    } catch {
      show('Failed to delete sale', 'error')
    }
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const filtered = all.filter(s => {
    if (fPlatform && s.platformId !== fPlatform) return false
    if (fCategory && s.categoryId !== fCategory) return false
    if (fFrom     && s.dateSold   <  fFrom)      return false
    if (fTo       && s.dateSold   >  fTo)        return false
    return true
  })

  const totalPages      = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated       = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const statsRevenue    = all.reduce((s, x) => s + x.salePrice, 0)
  const statsProfit     = all.reduce((s, x) => s + x.netProfit, 0)
  const statsAvg        = all.length > 0 ? statsProfit / all.length : 0

  const filtRevenue     = filtered.reduce((s, x) => s + x.salePrice, 0)
  const filtProfit      = filtered.reduce((s, x) => s + x.netProfit, 0)
  const filtAvg         = filtered.length > 0 ? filtProfit / filtered.length : 0

  const matchedItems    = activeItems.filter(i =>
    !itemSearch ||
    i.sku.toLowerCase().includes(itemSearch.toLowerCase())          ||
    i.brand.toLowerCase().includes(itemSearch.toLowerCase())        ||
    i.categoryName.toLowerCase().includes(itemSearch.toLowerCase())
  )

  const platformOptions  = platforms.map(p => ({ value: p.id, label: p.name }))
  const fPlatformOptions = [{ value: '', label: 'All Platforms' }, ...platformOptions]
  const fCategoryOptions = [
    { value: '', label: 'All Categories' },
    ...categories.map(c => ({ value: c.id, label: c.name })),
  ]

  const hasFilters = !!(fPlatform || fCategory || fFrom || fTo)

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Sales Log</h2>
        <p className="text-sm text-gray-500 mt-1">Track every sale and profit calculation</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<Receipt className="h-5 w-5" />}    label="Total Sales"   value={all.length.toString()} />
        <StatCard icon={<DollarSign className="h-5 w-5" />} label="Total Revenue" value={fmt(statsRevenue)} />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Total Profit"  value={fmt(statsProfit)} />
        <StatCard icon={<BarChart2 className="h-5 w-5" />}  label="Avg Profit"    value={fmt(statsAvg)} />
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mb-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="w-40">
            <Select
              label="Platform"
              options={fPlatformOptions}
              value={fPlatform}
              onChange={e => { setFPlatform(e.target.value); setPage(1) }}
            />
          </div>
          <div className="w-40">
            <Select
              label="Category"
              options={fCategoryOptions}
              value={fCategory}
              onChange={e => { setFCategory(e.target.value); setPage(1) }}
            />
          </div>
          <div className="w-36">
            <Input
              label="From"
              type="date"
              value={fFrom}
              onChange={e => { setFFrom(e.target.value); setPage(1) }}
            />
          </div>
          <div className="w-36">
            <Input
              label="To"
              type="date"
              value={fTo}
              onChange={e => { setFTo(e.target.value); setPage(1) }}
            />
          </div>
          {hasFilters && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => { setFPlatform(''); setFCategory(''); setFFrom(''); setFTo(''); setPage(1) }}
            >
              Clear
            </Button>
          )}
          <div className="ml-auto">
            <Button onClick={openLogModal} size="sm">
              <Plus className="h-4 w-4 mr-1" />Log Sale
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-green-800 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500">No sales logged yet</p>
            <p className="text-xs text-gray-400 mt-1">Log your first sale to get started</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['SKU','Brand','Category','Sale Price','COGS','Fees','Postage','Net Profit','Days','Platform','Date Sold',''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginated.map(s => {
                    const fees = (s.salePrice * s.feePercentage / 100) + s.fixedFee
                    return (
                      <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs font-medium text-gray-900 whitespace-nowrap">{s.sku}</td>
                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{s.brand}</td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{s.categoryName}</td>
                        <td className="px-4 py-3 text-gray-900 whitespace-nowrap">{fmt(s.salePrice)}</td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmt(s.cogs)}</td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmt(fees)}</td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmt(s.postage)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${profitClass(s.netProfit)}`}>
                            {fmt(s.netProfit)}
                          </span>
                        </td>
                        <td className={`px-4 py-3 font-medium whitespace-nowrap ${daysClass(s.daysToSell)}`}>
                          {s.daysToSell}d
                        </td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{s.platformName}</td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{s.dateSold}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex gap-1">
                            <button
                              onClick={() => openEdit(s)}
                              className="p-1.5 text-gray-400 hover:text-green-800 rounded transition-colors"
                              title="Edit"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            {canDelete() && (
                              <button
                                onClick={() => setDeleteTarget(s)}
                                className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 border-t-2 border-gray-200">
                    <td colSpan={3} className="px-4 py-2 text-xs font-medium text-gray-500">
                      {filtered.length} sale{filtered.length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-4 py-2 text-xs font-semibold text-gray-700">{fmt(filtRevenue)}</td>
                    <td colSpan={3} />
                    <td className="px-4 py-2 text-xs font-semibold whitespace-nowrap">
                      <span className={filtProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                        {fmt(filtProfit)}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-500 whitespace-nowrap">avg {fmt(filtAvg)}</td>
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                </p>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const n = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                    return (
                      <button
                        key={n}
                        onClick={() => setPage(n)}
                        className={`w-7 h-7 rounded text-xs ${n === page ? 'bg-green-800 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        {n}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Log Sale Modal ─────────────────────────────────────────────────── */}
      <Modal
        isOpen={showLog}
        onClose={() => setShowLog(false)}
        title={logStep === 1 ? 'Log Sale — Select Item' : 'Log Sale — Sale Details'}
        size="md"
      >
        {logStep === 1 ? (
          <div className="space-y-3">
            <Input
              label="Search inventory"
              value={itemSearch}
              onChange={e => setItemSearch(e.target.value)}
              placeholder="SKU, brand, or category…"
            />

            <div className="border border-gray-200 rounded-md divide-y divide-gray-100 max-h-56 overflow-y-auto">
              {matchedItems.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-gray-400">No active items found</p>
              ) : (
                matchedItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setLogItem(item)}
                    className={`w-full text-left px-3 py-2.5 hover:bg-gray-50 transition-colors ${logItem?.id === item.id ? 'bg-green-50' : ''}`}
                  >
                    <div className="font-mono text-sm font-medium text-gray-900">{item.sku}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {item.brand} — {item.categoryName} — {item.size} — {fmt(item.cogs)} cost
                    </div>
                  </button>
                ))
              )}
            </div>

            {logItem && (
              <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Selected Item</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div><span className="text-gray-500">SKU: </span><span className="font-mono font-medium">{logItem.sku}</span></div>
                  <div><span className="text-gray-500">Brand: </span>{logItem.brand}</div>
                  <div><span className="text-gray-500">Cost: </span>{fmt(logItem.cogs)}</div>
                  <div><span className="text-gray-500">Size: </span>{logItem.size}</div>
                  <div><span className="text-gray-500">Listed: </span>{logItem.dateListed.split('T')[0]}</div>
                  <div><span className="text-gray-500">Days Listed: </span>{logItem.daysListed}d</div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-1">
              <Button onClick={() => setLogStep(2)} disabled={!logItem}>
                Continue
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-md border border-gray-200 text-sm">
              <span className="font-mono font-medium text-gray-900">{logItem?.sku}</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-600">{logItem?.brand}</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500">{fmt(logItem?.cogs ?? 0)} cost</span>
              <button
                onClick={() => setLogStep(1)}
                className="ml-auto text-xs text-green-800 hover:underline"
              >
                Change
              </button>
            </div>

            <Select
              label="Platform"
              options={[{ value: '', label: 'Select platform…' }, ...platformOptions]}
              value={logPlatformId}
              onChange={e => setLogPlatformId(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Sale Price ($)"
                type="number"
                step="0.01"
                min="0"
                value={logSalePrice}
                onChange={e => setLogSalePrice(e.target.value)}
                required
              />
              <Input
                label="Postage ($)"
                type="number"
                step="0.01"
                min="0"
                value={logPostage}
                onChange={e => setLogPostage(e.target.value)}
                required
              />
            </div>

            <Input
              label="Date Sold"
              type="date"
              value={logDateSold}
              onChange={e => setLogDateSold(e.target.value)}
              required
            />

            <PreviewPanel
              preview={logPreview}
              salePrice={logSalePrice}
              postage={logPostage}
              loading={logPreviewLoad}
            />

            <div className="flex justify-between pt-1">
              <Button variant="secondary" onClick={() => setLogStep(1)}>Back</Button>
              <Button onClick={handleLogSale} loading={logSubmitting}>Log Sale</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Edit Modal ─────────────────────────────────────────────────────── */}
      <Modal
        isOpen={!!editSale}
        onClose={() => setEditSale(null)}
        title="Edit Sale"
        size="md"
      >
        {editSale && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-md border border-gray-200 text-sm">
              <span className="font-mono font-medium text-gray-900">{editSale.sku}</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500">{editSale.platformName}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Sale Price ($)"
                type="number"
                step="0.01"
                min="0"
                value={editSalePrice}
                onChange={e => setEditSalePrice(e.target.value)}
                required
              />
              <Input
                label="Postage ($)"
                type="number"
                step="0.01"
                min="0"
                value={editPostage}
                onChange={e => setEditPostage(e.target.value)}
                required
              />
            </div>

            <Input
              label="Date Sold"
              type="date"
              value={editDateSold}
              onChange={e => setEditDateSold(e.target.value)}
              required
            />

            <PreviewPanel
              preview={editPreview}
              salePrice={editSalePrice}
              postage={editPostage}
              loading={editPreviewLoad}
            />

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="secondary" onClick={() => setEditSale(null)}>Cancel</Button>
              <Button onClick={handleEditSave} loading={editSubmitting}>Save Changes</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Delete Confirm ─────────────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Sale"
        message={`Delete the sale for ${deleteTarget?.sku ?? ''}? The inventory item will be restored to Active.`}
        confirmLabel="Delete"
      />
    </div>
  )
}

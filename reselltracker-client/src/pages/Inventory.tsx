import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Package, DollarSign, Wallet } from 'lucide-react'
import inventoryService from '../services/inventoryService'
import categoryService from '../services/categoryService'
import supplierService from '../services/supplierService'
import platformService from '../services/platformService'
import skuService from '../services/skuService'
import type {
  InventoryItem, Category, Supplier, Platform, InventoryRequest, SkuRegistry
} from '../types'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Badge } from '../components/ui/Badge'
import { useToast } from '../components/ui/Toast'

const PAGE_SIZE = 25

const SIZE_OPTIONS = [
  { value: 'XS', label: 'XS' }, { value: 'S', label: 'S' }, { value: 'M', label: 'M' },
  { value: 'L', label: 'L' },  { value: 'XL', label: 'XL' }, { value: 'XXL', label: 'XXL' },
  { value: 'OS', label: 'One Size' },
]

const STATUS_OPTIONS = [
  { value: 'Active',   label: 'Active' },
  { value: 'Sold',     label: 'Sold' },
  { value: 'Unlisted', label: 'Unlisted' },
]

const statusBadge = (s: string) => {
  if (s === 'Active')   return <Badge variant="success" label="Active" />
  if (s === 'Sold')     return <Badge variant="info"    label="Sold" />
  return <Badge variant="neutral" label="Unlisted" />
}

const daysColor = (d: number) => {
  if (d < 30) return 'text-emerald-600'
  if (d < 60) return 'text-amber-500'
  if (d < 90) return 'text-orange-500'
  return 'text-red-600'
}

interface FormData {
  sku: string; brand: string; categoryId: string; size: string
  cogs: string; supplierId: string; platformId: string; dateListed: string; status: string
}

const emptyForm: FormData = {
  sku: '', brand: '', categoryId: '', size: 'M',
  cogs: '', supplierId: '', platformId: '', dateListed: new Date().toISOString().split('T')[0], status: 'Active'
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 bg-green-50 rounded-md flex items-center justify-center">
          <Icon className="h-4 w-4 text-green-800" />
        </div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-xl font-semibold text-gray-900 mt-0.5">{value}</p>
        </div>
      </div>
    </div>
  )
}

export default function Inventory() {
  const { show }   = useToast()
  const { user }   = useAuth()
  const location   = useLocation()
  const isOwner    = user?.role === 'Owner'

  // Reference data
  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers]   = useState<Supplier[]>([])
  const [platforms, setPlatforms]   = useState<Platform[]>([])

  // Stats
  const [activeItems, setActiveItems] = useState<InventoryItem[]>([])

  // Table
  const [items, setItems]     = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage]       = useState(1)

  // Filters
  const [filterStatus,   setFilterStatus]   = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterSupplier, setFilterSupplier] = useState('')
  const [searchInput,    setSearchInput]    = useState('')
  const [search,         setSearch]         = useState('')

  // Modals
  const [modalOpen,    setModalOpen]    = useState(false)
  const [editing,      setEditing]      = useState<InventoryItem | null>(null)
  const [form,         setForm]         = useState<FormData>(emptyForm)
  const [confirmId,    setConfirmId]    = useState<string | null>(null)
  const [saving,       setSaving]       = useState(false)
  const [deleting,     setDeleting]     = useState(false)
  const [skuPickerOpen, setSkuPickerOpen] = useState(false)
  const [recentSkus,   setRecentSkus]   = useState<SkuRegistry[]>([])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1) }, 300)
    return () => clearTimeout(t)
  }, [searchInput])

  // Load reference data once
  useEffect(() => {
    Promise.all([
      categoryService.getAll(),
      supplierService.getAll(),
      platformService.getAll(),
      inventoryService.getActive(),
    ]).then(([cats, sups, plats, active]) => {
      setCategories(cats.data)
      setSuppliers(sups.data)
      setPlatforms(plats.data)
      setActiveItems(active.data)
      if (cats.data.length > 0) setForm(f => ({ ...f, categoryId: cats.data[0].id }))
    }).catch(() => show('Failed to load reference data', 'error'))
  }, [])

  // Load items when filters change
  useEffect(() => {
    setLoading(true)
    inventoryService.getAll({
      status:     filterStatus     || undefined,
      categoryId: filterCategory   || undefined,
      supplierId: filterSupplier   || undefined,
      search:     search           || undefined,
    }).then(r => setItems(r.data))
      .catch(() => show('Failed to load inventory', 'error'))
      .finally(() => setLoading(false))
  }, [filterStatus, filterCategory, filterSupplier, search])

  // Handle prefill from SkuGenerator
  const prefillHandled = useRef(false)
  useEffect(() => {
    if (prefillHandled.current) return
    const p = (location.state as { prefill?: Partial<FormData> })?.prefill
    if (p) {
      prefillHandled.current = true
      setForm(f => ({ ...f, ...p }))
      setModalOpen(true)
      window.history.replaceState({}, '')
    }
  }, [location.state])

  const loadItems = () => {
    inventoryService.getAll({
      status:     filterStatus   || undefined,
      categoryId: filterCategory || undefined,
      supplierId: filterSupplier || undefined,
      search:     search         || undefined,
    }).then(r => setItems(r.data)).catch(() => {})
    inventoryService.getActive().then(r => setActiveItems(r.data)).catch(() => {})
  }

  const openAdd = () => {
    setEditing(null)
    setForm(f => ({ ...emptyForm, categoryId: f.categoryId }))
    setModalOpen(true)
  }

  const openEdit = (item: InventoryItem) => {
    setEditing(item)
    setForm({
      sku:        item.sku,
      brand:      item.brand,
      categoryId: item.categoryId,
      size:       item.size,
      cogs:       item.cogs.toString(),
      supplierId: item.supplierId ?? '',
      platformId: item.platformId ?? '',
      dateListed: item.dateListed.split('T')[0],
      status:     item.status,
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.sku || !form.brand || !form.categoryId || !form.supplierId) {
      show('Please fill in all required fields', 'warning')
      return
    }
    setSaving(true)
    const payload: InventoryRequest = {
      sku:        form.sku,
      brand:      form.brand,
      categoryId: form.categoryId,
      size:       form.size,
      cogs:       parseFloat(form.cogs) || 0,
      supplierId: form.supplierId || null,
      platformId: form.platformId || null,
      dateListed: form.dateListed,
      status:     form.status,
    }
    try {
      if (editing) {
        await inventoryService.update(editing.id, payload)
        show('Item updated', 'success')
      } else {
        await inventoryService.create(payload)
        show('Item added to inventory', 'success')
      }
      setModalOpen(false)
      loadItems()
    } catch {
      show('Failed to save item', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmId) return
    setDeleting(true)
    try {
      await inventoryService.remove(confirmId)
      show('Item deleted', 'success')
      setConfirmId(null)
      loadItems()
    } catch {
      show('Failed to delete item', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const openSkuPicker = async () => {
    const res = await skuService.getRecent()
    setRecentSkus(res.data)
    setSkuPickerOpen(true)
  }

  const clearFilters = () => {
    setFilterStatus(''); setFilterCategory(''); setFilterSupplier('')
    setSearchInput(''); setSearch(''); setPage(1)
  }

  // Pagination
  const totalPages = Math.ceil(items.length / PAGE_SIZE)
  const paged      = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Stats
  const totalCogs = activeItems.reduce((s, i) => s + i.cogs, 0)

  const catOptions = [
    { value: '', label: 'All Categories' },
    ...categories.map(c => ({ value: c.id, label: c.name }))
  ]
  const supFilterOptions = [
    { value: '', label: 'All Suppliers' },
    ...suppliers.map(s => ({ value: s.id, label: s.name }))
  ]
  const statusFilterOptions = [
    { value: '', label: 'All Statuses' },
    ...STATUS_OPTIONS,
  ]
  const catFormOptions  = categories.map(c => ({ value: c.id, label: c.name }))
  const supFormOptions  = [{ value: '', label: '— None —' }, ...suppliers.map(s => ({ value: s.id, label: s.name }))]
  const platFormOptions = [{ value: '', label: '— None —' }, ...platforms.map(p => ({ value: p.id, label: p.name }))]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Inventory</h2>
          <p className="text-sm text-gray-500 mt-1">Track and manage your stock</p>
        </div>
        <Button onClick={openAdd}>+ Add Item</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard icon={Package}     label="Active Items"        value={activeItems.length.toString()} />
        <StatCard icon={DollarSign}  label="Inventory Value"     value={`$${totalCogs.toFixed(2)}`} />
        <StatCard icon={Wallet}      label="Cash Tied in Stock"  value={`$${totalCogs.toFixed(2)}`} />
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 mb-4 flex flex-wrap gap-2 items-center">
        <input
          type="text"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          placeholder="Search SKU or brand..."
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-700 w-48"
        />
        <select
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-700"
        >
          {statusFilterOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          value={filterCategory}
          onChange={e => { setFilterCategory(e.target.value); setPage(1) }}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-700"
        >
          {catOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          value={filterSupplier}
          onChange={e => { setFilterSupplier(e.target.value); setPage(1) }}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-700"
        >
          {supFilterOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {(filterStatus || filterCategory || filterSupplier || searchInput) && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>Clear</Button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {['SKU','Brand','Category','Size','Cost','Supplier','Platform','Listed','Days','Status','Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 11 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" /></td>
                  ))}
                </tr>
              ))
              : paged.length === 0
                ? <tr><td colSpan={11} className="px-4 py-12 text-center text-sm text-gray-400">No items found. Try adjusting your filters.</td></tr>
                : paged.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-medium text-gray-900">{item.sku}</td>
                    <td className="px-4 py-3 text-gray-700">{item.brand}</td>
                    <td className="px-4 py-3 text-gray-700">{item.categoryName}</td>
                    <td className="px-4 py-3 text-gray-700">{item.size}</td>
                    <td className="px-4 py-3 text-gray-700">${item.cogs.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-700">{item.supplierName ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-700">{item.platformName ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(item.dateListed).toLocaleDateString('en-GB')}
                    </td>
                    <td className={`px-4 py-3 font-medium tabular-nums ${daysColor(item.daysListed)}`}>
                      {item.daysListed}d
                    </td>
                    <td className="px-4 py-3">{statusBadge(item.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>Edit</Button>
                        {isOwner && (
                          <Button variant="danger" size="sm" onClick={() => setConfirmId(item.id)}>Delete</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>

      {/* Footer totals + Pagination */}
      <div className="flex items-center justify-between mt-3">
        <p className="text-sm text-gray-500">
          {loading ? '' : (
            <>
              Showing {items.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, items.length)} of {items.length} items
              {' · '}Total cost: <span className="font-medium text-gray-700">${items.reduce((s, i) => s + i.cogs, 0).toFixed(2)}</span>
            </>
          )}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <span className="text-sm text-gray-500">{page} / {totalPages}</span>
            <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Item' : 'Add Inventory Item'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Input
                  label="SKU" required
                  value={form.sku}
                  onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
                  placeholder="e.g. NIK-TOP-M-CB-0001"
                />
              </div>
              <Button variant="secondary" size="sm" onClick={openSkuPicker} type="button">
                Pick from Registry
              </Button>
            </div>
          </div>
          <Input
            label="Brand" required
            value={form.brand}
            onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
          />
          <Select
            label="Size" required
            options={SIZE_OPTIONS}
            value={form.size}
            onChange={e => setForm(f => ({ ...f, size: e.target.value }))}
          />
          <Select
            label="Category" required
            options={catFormOptions}
            value={form.categoryId}
            onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
          />
          <Input
            label="Cost Price ($)" type="number" min={0} step={0.01} required
            value={form.cogs}
            onChange={e => setForm(f => ({ ...f, cogs: e.target.value }))}
            placeholder="0.00"
          />
          <Select
            label="Supplier" required
            options={supFormOptions}
            value={form.supplierId}
            onChange={e => setForm(f => ({ ...f, supplierId: e.target.value }))}
          />
          <Select
            label="Platform"
            options={platFormOptions}
            value={form.platformId}
            onChange={e => setForm(f => ({ ...f, platformId: e.target.value }))}
          />
          <Input
            label="Date Listed" type="date" required
            value={form.dateListed}
            onChange={e => setForm(f => ({ ...f, dateListed: e.target.value }))}
          />
          <Select
            label="Status"
            options={STATUS_OPTIONS}
            value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} loading={saving}>{editing ? 'Save Changes' : 'Add Item'}</Button>
        </div>
      </Modal>

      {/* SKU Picker */}
      <Modal isOpen={skuPickerOpen} onClose={() => setSkuPickerOpen(false)} title="Pick from SKU Registry" size="md">
        <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto -mx-6">
          {recentSkus.length === 0
            ? <p className="px-6 py-8 text-center text-sm text-gray-400">No SKUs in registry yet</p>
            : recentSkus.map(s => (
              <button
                key={s.id}
                className="w-full text-left px-6 py-3 hover:bg-gray-50 transition-colors"
                onClick={() => {
                  setForm(f => ({ ...f, sku: s.sku }))
                  setSkuPickerOpen(false)
                }}
              >
                <p className="font-mono text-sm font-medium text-gray-900">{s.sku}</p>
                <p className="text-xs text-gray-400 mt-0.5">{new Date(s.createdAt).toLocaleDateString()}</p>
              </button>
            ))
          }
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={handleDelete}
        title="Delete Inventory Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        loading={deleting}
      />
    </div>
  )
}

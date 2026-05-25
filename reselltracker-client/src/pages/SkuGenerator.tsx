import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Copy, Check, ArrowRight } from 'lucide-react'
import skuService from '../services/skuService'
import categoryService from '../services/categoryService'
import supplierService from '../services/supplierService'
import type { Category, Supplier, SkuGenerateResponse, SkuRegistry } from '../types'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { useToast } from '../components/ui/Toast'

const SIZE_OPTIONS = [
  { value: 'XS',       label: 'XS' },
  { value: 'S',        label: 'S' },
  { value: 'M',        label: 'M' },
  { value: 'L',        label: 'L' },
  { value: 'XL',       label: 'XL' },
  { value: 'XXL',      label: 'XXL' },
  { value: 'OS',       label: 'One Size' },
]

interface FormState {
  brand: string
  categoryId: string
  size: string
  supplierId: string
}

export default function SkuGenerator() {
  const { show }                   = useToast()
  const navigate                   = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers]   = useState<Supplier[]>([])
  const [recentSkus, setRecentSkus] = useState<SkuRegistry[]>([])
  const [loadingRef, setLoadingRef] = useState(true)
  const [form, setForm]             = useState<FormState>({ brand: '', categoryId: '', size: 'M', supplierId: '' })
  const [result, setResult]         = useState<SkuGenerateResponse | null>(null)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied]         = useState(false)

  useEffect(() => {
    Promise.all([
      categoryService.getAll(),
      supplierService.getAll(true),
      skuService.getRecent(),
    ]).then(([cats, sups, recent]) => {
      setCategories(cats.data)
      setSuppliers(sups.data)
      setRecentSkus(recent.data)
      if (cats.data.length > 0) setForm(f => ({ ...f, categoryId: cats.data[0].id }))
      if (sups.data.length > 0) setForm(f => ({ ...f, supplierId: sups.data[0].id }))
    }).catch(() => show('Failed to load reference data', 'error'))
      .finally(() => setLoadingRef(false))
  }, [])

  const handleGenerate = async () => {
    if (!form.brand.trim() || !form.categoryId || !form.supplierId) {
      show('Please fill in all fields', 'warning')
      return
    }
    setGenerating(true)
    try {
      const res = await skuService.generate({
        brand:      form.brand.trim(),
        categoryId: form.categoryId,
        size:       form.size,
        supplierId: form.supplierId,
      })
      setResult(res.data)
      show(`SKU generated: ${res.data.sku}`, 'success')
      const recent = await skuService.getRecent()
      setRecentSkus(recent.data)
    } catch {
      show('Failed to generate SKU', 'error')
    } finally {
      setGenerating(false)
    }
  }

  const handleCopy = async (sku: string) => {
    await navigator.clipboard.writeText(sku)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAddToInventory = () => {
    if (!result) return
    navigate('/inventory', {
      state: {
        prefill: {
          sku:        result.sku,
          brand:      form.brand.trim(),
          categoryId: form.categoryId,
          size:       form.size,
          supplierId: form.supplierId,
        }
      }
    })
  }

  const categoryName   = categories.find(c => c.id === form.categoryId)?.name ?? ''
  const supplierName   = suppliers.find(s => s.id === form.supplierId)?.name ?? ''

  const catOptions  = categories.map(c => ({ value: c.id, label: c.name }))
  const supOptions  = suppliers.map(s => ({ value: s.id, label: s.name }))

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">SKU Generator</h2>
        <p className="text-sm text-gray-500 mt-1">Generate unique SKU codes for your inventory</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left — Form + Result */}
        <div className="lg:col-span-3 space-y-5">
          {/* Form card */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Generate a new SKU</h3>
            <div className="space-y-4">
              <Input
                label="Brand"
                value={form.brand}
                onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                placeholder="e.g. Nike, Adidas, Zara"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Category"
                  options={catOptions}
                  value={form.categoryId}
                  onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                  required
                  disabled={loadingRef}
                />
                <Select
                  label="Size"
                  options={SIZE_OPTIONS}
                  value={form.size}
                  onChange={e => setForm(f => ({ ...f, size: e.target.value }))}
                  required
                />
              </div>
              <Select
                label="Supplier"
                options={supOptions}
                value={form.supplierId}
                onChange={e => setForm(f => ({ ...f, supplierId: e.target.value }))}
                required
                disabled={loadingRef}
              />
              <Button
                onClick={handleGenerate}
                loading={generating}
                className="w-full"
                size="lg"
              >
                Generate SKU
              </Button>
            </div>
          </div>

          {/* Result card */}
          {result && (
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-900">Generated SKU</h3>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleCopy(result.sku)}
                  >
                    {copied
                      ? <><Check className="h-3.5 w-3.5" /> Copied</>
                      : <><Copy className="h-3.5 w-3.5" /> Copy</>}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAddToInventory}
                  >
                    Add to Inventory <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <p className="text-2xl font-mono font-semibold text-gray-900 tracking-wider mb-5">
                {result.sku}
              </p>

              <div className="border border-gray-100 rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Meaning</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="px-3 py-2 font-mono font-medium text-green-800">{result.brandCode}</td>
                      <td className="px-3 py-2 text-gray-600">{form.brand}</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-mono font-medium text-green-800">{result.categoryCode}</td>
                      <td className="px-3 py-2 text-gray-600">{categoryName}</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-mono font-medium text-green-800">{result.sizeCode}</td>
                      <td className="px-3 py-2 text-gray-600">Size: {form.size}</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-mono font-medium text-green-800">{result.supplierCode}</td>
                      <td className="px-3 py-2 text-gray-600">{supplierName}</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-mono font-medium text-green-800">{String(result.sequenceNumber).padStart(4, '0')}</td>
                      <td className="px-3 py-2 text-gray-600">Sequence #{result.sequenceNumber}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right — Recent SKUs */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">Recently Generated</h3>
            </div>
            <div className="divide-y divide-gray-100 max-h-[520px] overflow-y-auto">
              {recentSkus.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-gray-400">No SKUs generated yet</p>
              ) : (
                recentSkus.map(s => (
                  <button
                    key={s.id}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors group"
                    onClick={() => handleCopy(s.sku)}
                    title="Click to copy"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-medium text-gray-900">{s.sku}</span>
                      <Copy className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                    </div>
                    <div className="flex gap-3 mt-0.5">
                      <span className="text-xs text-gray-400">{s.brandCode}</span>
                      <span className="text-xs text-gray-400">{s.categoryCode}</span>
                      <span className="text-xs text-gray-400">{s.sizeCode}</span>
                      <span className="text-xs text-gray-400">{s.supplierCode}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

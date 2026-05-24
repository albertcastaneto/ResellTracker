import { useEffect, useState } from 'react'
import supplierService from '../services/supplierService'
import type { Supplier, SupplierRequest } from '../types'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Table, type Column } from '../components/ui/Table'
import { Badge } from '../components/ui/Badge'
import { useToast } from '../components/ui/Toast'

const TYPE_OPTIONS = [
  { value: 'Car Boot',      label: 'Car Boot' },
  { value: 'Charity Shop',  label: 'Charity Shop' },
  { value: 'Wholesale',     label: 'Wholesale' },
  { value: 'Online',        label: 'Online' },
  { value: 'Other',         label: 'Other' },
]

const emptyForm: SupplierRequest = {
  name: '', type: 'Car Boot', location: '', notes: '', isActive: true,
}

export default function Suppliers() {
  const { show }               = useToast()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading]     = useState(true)
  const [activeOnly, setActiveOnly] = useState(false)
  const [modalOpen, setModalOpen]   = useState(false)
  const [saving, setSaving]         = useState(false)
  const [editing, setEditing]       = useState<Supplier | null>(null)
  const [form, setForm]             = useState<SupplierRequest>(emptyForm)
  const [confirmId, setConfirmId]   = useState<string | null>(null)
  const [deleting, setDeleting]     = useState(false)

  const load = () => {
    setLoading(true)
    supplierService.getAll(activeOnly || undefined)
      .then(r => setSuppliers(r.data))
      .catch(() => show('Failed to load suppliers', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [activeOnly])

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (s: Supplier) => {
    setEditing(s)
    setForm({ name: s.name, type: s.type, location: s.location ?? '', notes: s.notes ?? '', isActive: s.isActive })
    setModalOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editing) {
        await supplierService.update(editing.id, form)
        show('Supplier updated successfully', 'success')
      } else {
        await supplierService.create(form)
        show('Supplier added successfully', 'success')
      }
      setModalOpen(false)
      load()
    } catch {
      show('Failed to save supplier', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmId) return
    setDeleting(true)
    try {
      await supplierService.remove(confirmId)
      show('Supplier deleted', 'success')
      setConfirmId(null)
      load()
    } catch {
      show('Failed to delete supplier', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const columns: Column<Supplier>[] = [
    { key: 'name',     header: 'Name',     sortable: true },
    { key: 'type',     header: 'Type',     sortable: true },
    { key: 'location', header: 'Location', render: r => r.location ?? '—' },
    {
      key: 'isActive', header: 'Status',
      render: r => <Badge variant={r.isActive ? 'success' : 'neutral'} label={r.isActive ? 'Active' : 'Inactive'} />
    },
    {
      key: 'actions', header: 'Actions',
      render: r => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>Edit</Button>
          <Button variant="danger" size="sm" onClick={() => setConfirmId(r.id)}>Delete</Button>
        </div>
      )
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Suppliers</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage your sourcing suppliers</p>
        </div>
        <Button onClick={openAdd}>+ Add Supplier</Button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-4">
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox" checked={activeOnly}
            onChange={e => setActiveOnly(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600"
          />
          Active only
        </label>
      </div>

      <Table
        columns={columns}
        data={suppliers}
        isLoading={loading}
        rowKey={r => r.id}
        emptyMessage="No suppliers found. Add your first supplier."
      />

      {/* Add / Edit modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Supplier' : 'Add Supplier'}>
        <div className="space-y-4">
          <Input
            label="Supplier Name" required
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
          <Select
            label="Type" required
            options={TYPE_OPTIONS}
            value={form.type}
            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
          />
          <Input
            label="Location"
            value={form.location}
            onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
            placeholder="e.g. Manchester, UK"
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={3}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Any notes about this supplier..."
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox" checked={form.isActive}
              onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600"
            />
            Active
          </label>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} loading={saving}>
            {editing ? 'Save Changes' : 'Add Supplier'}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={handleDelete}
        title="Delete Supplier"
        message="Are you sure you want to delete this supplier? This action cannot be undone."
        loading={deleting}
      />
    </div>
  )
}

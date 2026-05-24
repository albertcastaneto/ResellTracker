import { useEffect, useState } from 'react'
import platformService from '../services/platformService'
import type { Platform, PlatformRequest } from '../types'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Input } from '../components/ui/Input'
import { Table, type Column } from '../components/ui/Table'
import { Badge } from '../components/ui/Badge'
import { useToast } from '../components/ui/Toast'

const emptyForm: PlatformRequest = {
  name: '', feePercentage: 0, fixedFee: 0, defaultPostage: 0, isActive: true,
}

export default function FeesTable() {
  const { show }           = useToast()
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [loading, setLoading]     = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving]       = useState(false)
  const [editing, setEditing]     = useState<Platform | null>(null)
  const [form, setForm]           = useState<PlatformRequest>(emptyForm)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deleting, setDeleting]   = useState(false)

  const load = () => {
    setLoading(true)
    platformService.getAll()
      .then(r => setPlatforms(r.data))
      .catch(() => show('Failed to load platforms', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (p: Platform) => {
    setEditing(p)
    setForm({ name: p.name, feePercentage: p.feePercentage, fixedFee: p.fixedFee, defaultPostage: p.defaultPostage, isActive: p.isActive })
    setModalOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editing) {
        await platformService.update(editing.id, form)
        show('Platform updated successfully', 'success')
      } else {
        await platformService.create(form)
        show('Platform added successfully', 'success')
      }
      setModalOpen(false)
      load()
    } catch {
      show('Failed to save platform', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmId) return
    setDeleting(true)
    try {
      await platformService.remove(confirmId)
      show('Platform deleted', 'success')
      setConfirmId(null)
      load()
    } catch {
      show('Failed to delete platform', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const columns: Column<Platform>[] = [
    { key: 'name',           header: 'Platform Name',     sortable: true },
    { key: 'feePercentage',  header: 'Fee %',             sortable: true, render: r => `${r.feePercentage}%` },
    { key: 'fixedFee',       header: 'Fixed Fee (£)',     sortable: true, render: r => `£${r.fixedFee.toFixed(2)}` },
    { key: 'defaultPostage', header: 'Default Postage (£)', sortable: true, render: r => `£${r.defaultPostage.toFixed(2)}` },
    { key: 'isActive',       header: 'Active',            render: r => <Badge variant={r.isActive ? 'success' : 'neutral'} label={r.isActive ? 'Active' : 'Inactive'} /> },
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
          <h2 className="text-xl font-bold text-gray-900">Fees & Postage Table</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage selling platform fees and postage rates</p>
        </div>
        <Button onClick={openAdd}>+ Add Platform</Button>
      </div>

      <Table
        columns={columns}
        data={platforms}
        isLoading={loading}
        rowKey={r => r.id}
        emptyMessage="No platforms configured yet."
      />

      {/* Add / Edit modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Platform' : 'Add Platform'}>
        <div className="space-y-4">
          <Input
            label="Platform Name" required
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Fee %" type="number" min={0} max={100} step={0.01} required
              value={form.feePercentage}
              onChange={e => setForm(f => ({ ...f, feePercentage: parseFloat(e.target.value) || 0 }))}
            />
            <Input
              label="Fixed Fee (£)" type="number" min={0} step={0.01}
              value={form.fixedFee}
              onChange={e => setForm(f => ({ ...f, fixedFee: parseFloat(e.target.value) || 0 }))}
            />
            <Input
              label="Default Postage (£)" type="number" min={0} step={0.01}
              value={form.defaultPostage}
              onChange={e => setForm(f => ({ ...f, defaultPostage: parseFloat(e.target.value) || 0 }))}
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
            {editing ? 'Save Changes' : 'Add Platform'}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={handleDelete}
        title="Delete Platform"
        message="Are you sure you want to delete this platform? This action cannot be undone."
        loading={deleting}
      />
    </div>
  )
}

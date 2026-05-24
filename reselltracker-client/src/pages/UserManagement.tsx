import { useEffect, useState } from 'react'
import userService from '../services/userService'
import type { User, UserRequest } from '../types'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Table, type Column } from '../components/ui/Table'
import { Badge } from '../components/ui/Badge'
import { useToast } from '../components/ui/Toast'

const ROLE_OPTIONS = [
  { value: 'Manager', label: 'Manager' },
  { value: 'Lister',  label: 'Lister' },
  { value: 'Viewer',  label: 'Viewer' },
]

const roleBadge: Record<string, 'purple' | 'blue' | 'green' | 'gray'> = {
  Owner:   'purple',
  Manager: 'blue',
  Lister:  'green',
  Viewer:  'gray',
}

const emptyForm: UserRequest = { email: '', displayName: '', role: 'Manager' }

export default function UserManagement() {
  const { show }           = useToast()
  const { user: me }       = useAuth()
  const [users, setUsers]  = useState<User[]>([])
  const [loading, setLoading]   = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving]       = useState(false)
  const [form, setForm]           = useState<UserRequest>(emptyForm)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deleting, setDeleting]   = useState(false)

  const load = () => {
    setLoading(true)
    userService.getAll()
      .then(r => setUsers(r.data))
      .catch(() => show('Failed to load users', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleCreate = async () => {
    setSaving(true)
    try {
      await userService.create(form)
      show('User created successfully', 'success')
      setModalOpen(false)
      load()
    } catch {
      show('Failed to create user', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleRoleChange = async (id: string, role: string) => {
    try {
      await userService.updateRole(id, { role })
      show('Role updated', 'success')
      load()
    } catch {
      show('Failed to update role', 'error')
    }
  }

  const handleToggleStatus = async (u: User) => {
    if (u.id === me?.userId) return
    const newStatus = u.status === 'Active' ? 'Inactive' : 'Active'
    try {
      await userService.updateStatus(u.id, { status: newStatus })
      show(`User ${newStatus === 'Active' ? 'activated' : 'deactivated'}`, 'success')
      load()
    } catch {
      show('Failed to update status', 'error')
    }
  }

  const handleDelete = async () => {
    if (!confirmId) return
    setDeleting(true)
    try {
      await userService.remove(confirmId)
      show('User deleted', 'success')
      setConfirmId(null)
      load()
    } catch {
      show('Failed to delete user', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const columns: Column<User>[] = [
    { key: 'displayName', header: 'Name', sortable: true, render: r => (
      <span className={r.id === me?.userId ? 'font-semibold text-indigo-700' : ''}>{r.displayName}</span>
    )},
    { key: 'email', header: 'Email', sortable: true },
    { key: 'role',  header: 'Role', render: r => (
      r.id === me?.userId
        ? <Badge variant={roleBadge[r.role] ?? 'gray'} label={r.role} />
        : (
          <select
            value={r.role}
            onChange={e => handleRoleChange(r.id, e.target.value)}
            className="text-xs border border-gray-300 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="Owner">Owner</option>
            <option value="Manager">Manager</option>
            <option value="Lister">Lister</option>
            <option value="Viewer">Viewer</option>
          </select>
        )
    )},
    { key: 'status', header: 'Status', render: r => (
      <Badge variant={r.status === 'Active' ? 'success' : 'neutral'} label={r.status} />
    )},
    { key: 'lastLogin', header: 'Last Login', render: r =>
      r.lastLogin ? new Date(r.lastLogin).toLocaleDateString() : '—'
    },
    { key: 'createdAt', header: 'Date Added', render: r =>
      new Date(r.createdAt).toLocaleDateString()
    },
    { key: 'actions', header: 'Actions', render: r => {
      const isSelf = r.id === me?.userId
      return (
        <div className="flex gap-2">
          <Button
            variant="secondary" size="sm"
            onClick={() => handleToggleStatus(r)}
            disabled={isSelf}
            title={isSelf ? 'Cannot change your own status' : undefined}
          >
            {r.status === 'Active' ? 'Deactivate' : 'Activate'}
          </Button>
          <Button
            variant="danger" size="sm"
            onClick={() => setConfirmId(r.id)}
            disabled={isSelf}
            title={isSelf ? 'Cannot delete your own account' : undefined}
          >
            Delete
          </Button>
        </div>
      )
    }},
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">User Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage team members and their roles</p>
        </div>
        <Button onClick={() => { setForm(emptyForm); setModalOpen(true) }}>+ Add User</Button>
      </div>

      <Table
        columns={columns}
        data={users}
        isLoading={loading}
        rowKey={r => r.id}
        emptyMessage="No users found."
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add User">
        <div className="space-y-4">
          <Input
            label="Email" type="email" required
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          />
          <Input
            label="Display Name" required
            value={form.displayName}
            onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
          />
          <Select
            label="Role" required
            options={ROLE_OPTIONS}
            value={form.role}
            onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleCreate} loading={saving}>Add User</Button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        loading={deleting}
      />
    </div>
  )
}

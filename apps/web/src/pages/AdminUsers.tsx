import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import * as api from '../lib/api'
import type { AdminUser } from '../lib/api'

const ALL_PERMISSIONS = [
  'usermanage:listusers',
  'usermanage:add',
  'usermanage:suspend',
  'usermanage:updatepassword',
]

export function AdminUsers() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)

  // Add user form
  const [showAddForm, setShowAddForm] = useState(false)
  const [addEmail, setAddEmail] = useState('')
  const [addPassword, setAddPassword] = useState('')
  const [addError, setAddError] = useState<string | null>(null)
  const [addLoading, setAddLoading] = useState(false)

  // Reset password modal
  const [resetTarget, setResetTarget] = useState<AdminUser | null>(null)
  const [resetPassword, setResetPassword] = useState('')
  const [resetError, setResetError] = useState<string | null>(null)
  const [resetLoading, setResetLoading] = useState(false)

  // Edit user modal
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null)
  const [editDisplayName, setEditDisplayName] = useState('')
  const [editAvatarUrl, setEditAvatarUrl] = useState('')
  const [editError, setEditError] = useState<string | null>(null)
  const [editLoading, setEditLoading] = useState(false)

  // Permissions modal
  const [permTarget, setPermTarget] = useState<AdminUser | null>(null)
  const [permSelection, setPermSelection] = useState<string[]>([])
  const [permError, setPermError] = useState<string | null>(null)
  const [permLoading, setPermLoading] = useState(false)

  const canAdd = me?.permissions.includes('usermanage:add') ?? false
  const canSuspend = me?.permissions.includes('usermanage:suspend') ?? false
  const canResetPassword = me?.permissions.includes('usermanage:updatepassword') ?? false
  const isAdmin = me?.role === 'admin'

  const load = async () => {
    const result = await api.listAdminUsers()
    if (api.isError(result)) { setLoadError(result.error.message); return }
    setUsers(result.data)
  }

  useEffect(() => { void load() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddError(null)
    setAddLoading(true)
    const result = await api.createAdminUser(addEmail, addPassword)
    setAddLoading(false)
    if (api.isError(result)) { setAddError(result.error.message); return }
    setAddEmail('')
    setAddPassword('')
    setShowAddForm(false)
    await load()
  }

  const handleSuspend = async (u: AdminUser) => {
    const fn = u.status === 'suspended' ? api.unsuspendUser : api.suspendUser
    const result = await fn(u.id)
    if (api.isError(result)) { alert(result.error.message); return }
    await load()
  }

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetTarget) return
    setResetError(null)
    setResetLoading(true)
    const result = await api.adminResetPassword(resetTarget.id, resetPassword)
    setResetLoading(false)
    if (api.isError(result)) { setResetError(result.error.message); return }
    setResetTarget(null)
    setResetPassword('')
  }

  const openEdit = (u: AdminUser) => {
    setEditTarget(u)
    setEditDisplayName(u.displayName ?? '')
    setEditAvatarUrl(u.avatarUrl ?? '')
    setEditError(null)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editTarget) return
    setEditError(null)
    setEditLoading(true)
    const result = await api.adminUpdateUser(editTarget.id, {
      display_name: editDisplayName,
      avatar_url: editAvatarUrl,
    })
    setEditLoading(false)
    if (api.isError(result)) { setEditError(result.error.message); return }
    setEditTarget(null)
    await load()
  }

  const openPermissions = (u: AdminUser) => {
    setPermTarget(u)
    setPermSelection(u.permissions)
    setPermError(null)
  }

  const handlePermSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!permTarget) return
    setPermError(null)
    setPermLoading(true)
    const result = await api.updateUserPermissions(permTarget.id, permSelection)
    setPermLoading(false)
    if (api.isError(result)) { setPermError(result.error.message); return }
    setPermTarget(null)
    await load()
  }

  if (loadError) {
    return <div className="max-w-5xl mx-auto mt-16 p-6 text-red-600">Failed to load users: {loadError}</div>
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        {canAdd && (
          <button
            onClick={() => setShowAddForm(v => !v)}
            className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm"
          >
            {showAddForm ? 'Cancel' : '+ Add user'}
          </button>
        )}
      </div>

      {/* Add user form */}
      {showAddForm && (
        <form onSubmit={handleAdd} className="mb-6 p-4 border rounded bg-white flex flex-col gap-3">
          <h2 className="font-semibold">Add new user</h2>
          <input
            type="email" placeholder="Email" required value={addEmail}
            onChange={e => setAddEmail(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          />
          <input
            type="password" placeholder="Temporary password (min 6 chars)" required minLength={6} value={addPassword}
            onChange={e => setAddPassword(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          />
          {addError && <p className="text-red-600 text-sm">{addError}</p>}
          <button
            type="submit" disabled={addLoading}
            className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm disabled:opacity-50 self-start"
          >
            {addLoading ? 'Creating…' : 'Create user'}
          </button>
        </form>
      )}

      {/* User table */}
      <div className="bg-white border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">User</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Permissions</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Joined</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium">{u.displayName ?? u.email}</div>
                  {u.displayName && <div className="text-gray-500 text-xs">{u.email}</div>}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                    u.status === 'suspended' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {u.permissions.length === 0
                      ? <span className="text-gray-400 text-xs">none</span>
                      : u.permissions.map(p => (
                        <span key={p} className="bg-blue-50 text-blue-700 text-xs px-1.5 py-0.5 rounded">
                          {p.replace('usermanage:', '')}
                        </span>
                      ))
                    }
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    {canSuspend && u.id !== me?.id && (
                      <button
                        onClick={() => handleSuspend(u)}
                        className={`text-xs px-2 py-1 rounded border ${
                          u.status === 'suspended'
                            ? 'border-green-300 text-green-700 hover:bg-green-50'
                            : 'border-red-300 text-red-700 hover:bg-red-50'
                        }`}
                      >
                        {u.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                      </button>
                    )}
                    {canResetPassword && u.id !== me?.id && (
                      <button
                        onClick={() => { setResetTarget(u); setResetPassword(''); setResetError(null) }}
                        className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Reset pwd
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => openEdit(u)}
                        className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Edit
                      </button>
                    )}
                    {isAdmin && u.id !== me?.id && (
                      <button
                        onClick={() => openPermissions(u)}
                        className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Permissions
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit user modal */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
            <h2 className="font-semibold mb-1">Edit user</h2>
            <p className="text-sm text-gray-500 mb-4">{editTarget.email}</p>
            <form onSubmit={handleEditSubmit} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Display name</label>
                <input
                  type="text" placeholder="Display name" value={editDisplayName}
                  onChange={e => setEditDisplayName(e.target.value)}
                  className="border rounded px-3 py-2 text-sm w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Avatar URL</label>
                <input
                  type="url" placeholder="https://…" value={editAvatarUrl}
                  onChange={e => setEditAvatarUrl(e.target.value)}
                  className="border rounded px-3 py-2 text-sm w-full"
                />
              </div>
              {editError && <p className="text-red-600 text-sm">{editError}</p>}
              <div className="flex gap-2">
                <button
                  type="submit" disabled={editLoading}
                  className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm disabled:opacity-50"
                >
                  {editLoading ? 'Saving…' : 'Save'}
                </button>
                <button
                  type="button" onClick={() => setEditTarget(null)}
                  className="px-4 py-2 rounded border text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset password modal */}
      {resetTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
            <h2 className="font-semibold mb-1">Reset password</h2>
            <p className="text-sm text-gray-500 mb-4">{resetTarget.email}</p>
            <form onSubmit={handleResetSubmit} className="flex flex-col gap-3">
              <input
                type="password" placeholder="New password (min 6 chars)" required minLength={6}
                value={resetPassword} onChange={e => setResetPassword(e.target.value)}
                className="border rounded px-3 py-2 text-sm"
              />
              {resetError && <p className="text-red-600 text-sm">{resetError}</p>}
              <div className="flex gap-2">
                <button
                  type="submit" disabled={resetLoading}
                  className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm disabled:opacity-50"
                >
                  {resetLoading ? 'Saving…' : 'Set password'}
                </button>
                <button
                  type="button" onClick={() => setResetTarget(null)}
                  className="px-4 py-2 rounded border text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permissions modal */}
      {permTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
            <h2 className="font-semibold mb-1">Manage permissions</h2>
            <p className="text-sm text-gray-500 mb-4">{permTarget.email}</p>
            <form onSubmit={handlePermSubmit} className="flex flex-col gap-3">
              {ALL_PERMISSIONS.map(p => (
                <label key={p} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permSelection.includes(p)}
                    onChange={e => setPermSelection(prev =>
                      e.target.checked ? [...prev, p] : prev.filter(x => x !== p)
                    )}
                  />
                  <span className="font-mono text-xs">{p}</span>
                </label>
              ))}
              {permError && <p className="text-red-600 text-sm">{permError}</p>}
              <div className="flex gap-2 mt-1">
                <button
                  type="submit" disabled={permLoading}
                  className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm disabled:opacity-50"
                >
                  {permLoading ? 'Saving…' : 'Save'}
                </button>
                <button
                  type="button" onClick={() => setPermTarget(null)}
                  className="px-4 py-2 rounded border text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

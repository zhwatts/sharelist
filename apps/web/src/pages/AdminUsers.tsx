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

  // Unified manage modal
  const [target, setTarget] = useState<AdminUser | null>(null)

  // Profile section
  const [displayName, setDisplayName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState(false)

  // Password section
  const [newPassword, setNewPassword] = useState('')
  const [pwdLoading, setPwdLoading] = useState(false)
  const [pwdError, setPwdError] = useState<string | null>(null)
  const [pwdSuccess, setPwdSuccess] = useState(false)

  // Permissions section
  const [permSelection, setPermSelection] = useState<string[]>([])
  const [permLoading, setPermLoading] = useState(false)
  const [permError, setPermError] = useState<string | null>(null)
  const [permSuccess, setPermSuccess] = useState(false)

  // Inline action loading
  const [suspendLoading, setSuspendLoading] = useState(false)
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  const canAdd = me?.permissions.includes('usermanage:add') ?? false
  const canSuspend = me?.permissions.includes('usermanage:suspend') ?? false
  const canResetPassword = me?.permissions.includes('usermanage:updatepassword') ?? false
  const isAdmin = me?.role === 'admin'
  const isSelf = target?.id === me?.id

  const load = async () => {
    const result = await api.listAdminUsers()
    if (api.isError(result)) { setLoadError(result.error.message); return }
    setUsers(result.data)
  }

  useEffect(() => { void load() }, [])

  const openManage = (u: AdminUser) => {
    setTarget(u)
    setDisplayName(u.displayName ?? '')
    setAvatarUrl(u.avatarUrl ?? '')
    setPermSelection(u.permissions)
    setNewPassword('')
    setProfileError(null); setProfileSuccess(false)
    setPwdError(null); setPwdSuccess(false)
    setPermError(null); setPermSuccess(false)
    setDeleteConfirm(false)
    setResendSuccess(false)
  }

  const closeManage = () => setTarget(null)

  // Reload and refresh modal state for the same user
  const reloadAndSync = async (id: string) => {
    const result = await api.listAdminUsers()
    if (api.isError(result)) return
    setUsers(result.data)
    const updated = result.data.find(u => u.id === id)
    if (updated) {
      setTarget(updated)
      setPermSelection(updated.permissions)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddError(null)
    setAddLoading(true)
    const result = await api.createAdminUser(addEmail, addPassword)
    setAddLoading(false)
    if (api.isError(result)) { setAddError(result.error.message); return }
    setAddEmail(''); setAddPassword('')
    setShowAddForm(false)
    await load()
  }

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!target) return
    setProfileError(null); setProfileSuccess(false)
    setProfileLoading(true)
    const result = await api.adminUpdateUser(target.id, { display_name: displayName, avatar_url: avatarUrl })
    setProfileLoading(false)
    if (api.isError(result)) { setProfileError(result.error.message); return }
    setProfileSuccess(true)
    await reloadAndSync(target.id)
  }

  const handleSuspendToggle = async () => {
    if (!target) return
    setSuspendLoading(true)
    const fn = target.status === 'suspended' ? api.unsuspendUser : api.suspendUser
    const result = await fn(target.id)
    setSuspendLoading(false)
    if (api.isError(result)) { alert(result.error.message); return }
    await reloadAndSync(target.id)
  }

  const handleVerify = async () => {
    if (!target) return
    setVerifyLoading(true)
    const result = await api.verifyUser(target.id)
    setVerifyLoading(false)
    if (api.isError(result)) { alert(result.error.message); return }
    await reloadAndSync(target.id)
  }

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!target) return
    setPwdError(null); setPwdSuccess(false)
    setPwdLoading(true)
    const result = await api.adminResetPassword(target.id, newPassword)
    setPwdLoading(false)
    if (api.isError(result)) { setPwdError(result.error.message); return }
    setNewPassword('')
    setPwdSuccess(true)
  }

  const handlePermSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!target) return
    setPermError(null); setPermSuccess(false)
    setPermLoading(true)
    const result = await api.updateUserPermissions(target.id, permSelection)
    setPermLoading(false)
    if (api.isError(result)) { setPermError(result.error.message); return }
    setPermSuccess(true)
    await reloadAndSync(target.id)
  }

  const handleResendVerification = async () => {
    if (!target) return
    setResendLoading(true)
    setResendSuccess(false)
    const result = await api.resendVerificationEmail(target.id)
    setResendLoading(false)
    if (api.isError(result)) { alert(result.error.message); return }
    setResendSuccess(true)
  }

  const handleDelete = async () => {
    if (!target) return
    setDeleteLoading(true)
    const result = await api.deleteAdminUser(target.id)
    setDeleteLoading(false)
    if (api.isError(result)) { alert(result.error.message); return }
    closeManage()
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
                  {!u.emailConfirmed && (
                    <span className="text-xs text-amber-600 font-medium">unverified</span>
                  )}
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
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => openManage(u)}
                    className="text-xs px-3 py-1.5 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Manage
                  </button>
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

      {/* Unified manage modal */}
      {target && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl shadow-xl flex flex-col max-h-[90vh]">

            {/* Header */}
            <div className="px-6 py-4 border-b flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">Manage user</h2>
                <p className="text-sm text-gray-500">{target.email}</p>
              </div>
              <button onClick={closeManage} className="text-gray-400 hover:text-gray-600 text-xl leading-none mt-0.5">×</button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 divide-y">

              {/* Profile */}
              <section className="px-6 py-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Profile</h3>
                <form onSubmit={handleProfileSave} className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Display name</label>
                      <input
                        type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                        placeholder="Display name"
                        className="border rounded px-3 py-2 text-sm w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Avatar URL</label>
                      <input
                        type="url" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)}
                        placeholder="https://…"
                        className="border rounded px-3 py-2 text-sm w-full"
                      />
                    </div>
                  </div>
                  {profileError && <p className="text-red-600 text-sm">{profileError}</p>}
                  {profileSuccess && <p className="text-green-600 text-sm">Saved.</p>}
                  <div>
                    <button
                      type="submit" disabled={profileLoading}
                      className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm disabled:opacity-50"
                    >
                      {profileLoading ? 'Saving…' : 'Save profile'}
                    </button>
                  </div>
                </form>
              </section>

              {/* Account actions */}
              <section className="px-6 py-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Account</h3>
                <div className="flex flex-wrap gap-3">
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${target.emailConfirmed ? 'text-green-600' : 'text-amber-600'}`}>
                        {target.emailConfirmed ? 'Email verified' : 'Email unverified'}
                      </span>
                      {!target.emailConfirmed && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleVerify} disabled={verifyLoading}
                            className="text-xs px-3 py-1.5 rounded border border-green-300 text-green-700 hover:bg-green-50 disabled:opacity-50"
                          >
                            {verifyLoading ? 'Verifying…' : 'Mark as verified'}
                          </button>
                          <button
                            onClick={handleResendVerification} disabled={resendLoading}
                            className="text-xs px-3 py-1.5 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                          >
                            {resendLoading ? 'Sending…' : 'Resend verification email'}
                          </button>
                          {resendSuccess && <span className="text-xs text-green-600">Sent.</span>}
                        </div>
                      )}
                    </div>
                  )}
                  {canSuspend && !isSelf && (
                    <button
                      onClick={handleSuspendToggle} disabled={suspendLoading}
                      className={`text-xs px-3 py-1.5 rounded border disabled:opacity-50 ${
                        target.status === 'suspended'
                          ? 'border-green-300 text-green-700 hover:bg-green-50'
                          : 'border-red-300 text-red-700 hover:bg-red-50'
                      }`}
                    >
                      {suspendLoading ? '…' : target.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                    </button>
                  )}
                </div>
              </section>

              {/* Password */}
              {canResetPassword && !isSelf && (
                <section className="px-6 py-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Reset password</h3>
                  <form onSubmit={handlePasswordSave} className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">New password</label>
                      <input
                        type="password" required minLength={6} value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="border rounded px-3 py-2 text-sm w-full"
                      />
                    </div>
                    <button
                      type="submit" disabled={pwdLoading}
                      className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm disabled:opacity-50 whitespace-nowrap"
                    >
                      {pwdLoading ? 'Saving…' : 'Set password'}
                    </button>
                  </form>
                  {pwdError && <p className="text-red-600 text-sm mt-2">{pwdError}</p>}
                  {pwdSuccess && <p className="text-green-600 text-sm mt-2">Password updated.</p>}
                </section>
              )}

              {/* Permissions */}
              {isAdmin && !isSelf && (
                <section className="px-6 py-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Permissions</h3>
                  <form onSubmit={handlePermSave} className="flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-2">
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
                    </div>
                    {permError && <p className="text-red-600 text-sm">{permError}</p>}
                    {permSuccess && <p className="text-green-600 text-sm">Permissions saved.</p>}
                    <div className="mt-1">
                      <button
                        type="submit" disabled={permLoading}
                        className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm disabled:opacity-50"
                      >
                        {permLoading ? 'Saving…' : 'Save permissions'}
                      </button>
                    </div>
                  </form>
                </section>
              )}
              {/* Danger zone */}
              {isAdmin && !isSelf && (
                <section className="px-6 py-5">
                  <h3 className="text-sm font-semibold text-red-600 mb-3">Danger zone</h3>
                  {!deleteConfirm ? (
                    <button
                      onClick={() => setDeleteConfirm(true)}
                      className="text-sm px-4 py-2 rounded border border-red-300 text-red-700 hover:bg-red-50"
                    >
                      Delete user
                    </button>
                  ) : (
                    <div className="flex items-center gap-3">
                      <p className="text-sm text-red-700">Permanently delete <strong>{target?.email}</strong> and all their data? This cannot be undone.</p>
                      <button
                        onClick={handleDelete} disabled={deleteLoading}
                        className="shrink-0 text-sm px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        {deleteLoading ? 'Deleting…' : 'Confirm delete'}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(false)}
                        className="shrink-0 text-sm px-3 py-2 rounded border hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </section>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t flex justify-end">
              <button
                onClick={closeManage}
                className="px-4 py-2 rounded border text-sm hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

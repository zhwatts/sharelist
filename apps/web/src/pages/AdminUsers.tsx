import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import * as api from '../lib/api'
import type { AdminUser } from '../lib/api'

const PERMISSION_META = [
  { key: 'usermanage:listusers', label: 'View users', description: 'Can access the user management page' },
  { key: 'usermanage:add', label: 'Create users', description: 'Can create new user accounts' },
  { key: 'usermanage:suspend', label: 'Suspend users', description: 'Can suspend and unsuspend accounts' },
  { key: 'usermanage:updatepassword', label: 'Reset passwords', description: 'Can reset passwords for other users' },
  { key: 'usermanage:deleteusers', label: 'Delete users', description: 'Can permanently delete user accounts' },
  { key: 'usermanage:editpermissions', label: 'Edit permissions', description: 'Can grant or revoke permissions for other users' },
  { key: 'usermanage:selfmanage', label: 'Full self-management', description: 'Can manage all aspects of their own account, including their own permissions' },
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
  const [unverifyLoading, setUnverifyLoading] = useState(false)
  const [magicLinkLoading, setMagicLinkLoading] = useState(false)
  const [magicLinkSuccess, setMagicLinkSuccess] = useState(false)

  const canAdd = me?.permissions.includes('usermanage:add') ?? false
  const canSuspend = me?.permissions.includes('usermanage:suspend') ?? false
  const canResetPassword = me?.permissions.includes('usermanage:updatepassword') ?? false
  const canDelete = me?.permissions.includes('usermanage:deleteusers') ?? false
  const canEditPermissions = me?.permissions.includes('usermanage:editpermissions') ?? false
  const canSelfManage = me?.permissions.includes('usermanage:selfmanage') ?? false
  const isAdmin = me?.role === 'admin'
  const isSelf = target?.id === me?.id
  // canActOnTarget: true when the viewer can take actions on this specific user
  // (either because it's not themselves, or because they hold usermanage:selfmanage)
  const canActOnTarget = !isSelf || canSelfManage
  // readOnly: can view the modal but has no write permissions applicable to this user
  const readOnly = !isAdmin && !canSuspend && !canResetPassword && !canEditPermissions && !canDelete && !(canSelfManage && isSelf)

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
    setMagicLinkSuccess(false)
  }

  const closeManage = () => setTarget(null)

  const reloadAndSync = async (id: string) => {
    const result = await api.listAdminUsers()
    if (api.isError(result)) return
    setUsers(result.data)
    const updated = result.data.find(u => u.id === id)
    if (updated) { setTarget(updated); setPermSelection(updated.permissions) }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddError(null); setAddLoading(true)
    const result = await api.createAdminUser(addEmail, addPassword)
    setAddLoading(false)
    if (api.isError(result)) { setAddError(result.error.message); return }
    setAddEmail(''); setAddPassword(''); setShowAddForm(false)
    await load()
  }

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!target) return
    setProfileError(null); setProfileSuccess(false); setProfileLoading(true)
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

  const handleUnverify = async () => {
    if (!target) return
    setUnverifyLoading(true)
    const result = await api.unverifyUser(target.id)
    setUnverifyLoading(false)
    if (api.isError(result)) { alert(result.error.message); return }
    await reloadAndSync(target.id)
  }

  const handleMagicLink = async () => {
    if (!target) return
    setMagicLinkLoading(true); setMagicLinkSuccess(false)
    const result = await api.sendMagicLink(target.id)
    setMagicLinkLoading(false)
    if (api.isError(result)) { alert(result.error.message); return }
    setMagicLinkSuccess(true)
  }

  const handleResendVerification = async () => {
    if (!target) return
    setResendLoading(true); setResendSuccess(false)
    const result = await api.resendVerificationEmail(target.id)
    setResendLoading(false)
    if (api.isError(result)) { alert(result.error.message); return }
    setResendSuccess(true)
  }

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!target) return
    setPwdError(null); setPwdSuccess(false); setPwdLoading(true)
    const result = await api.adminResetPassword(target.id, newPassword)
    setPwdLoading(false)
    if (api.isError(result)) { setPwdError(result.error.message); return }
    setNewPassword(''); setPwdSuccess(true)
  }

  const handlePermSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!target) return
    setPermError(null); setPermSuccess(false); setPermLoading(true)
    const result = await api.updateUserPermissions(target.id, permSelection)
    setPermLoading(false)
    if (api.isError(result)) { setPermError(result.error.message); return }
    setPermSuccess(true)
    await reloadAndSync(target.id)
  }

  const handleDelete = async () => {
    if (!target) return
    setDeleteLoading(true)
    const result = await api.deleteAdminUser(target.id)
    setDeleteLoading(false)
    if (api.isError(result)) { alert(result.error.message); return }
    closeManage(); await load()
  }

  if (loadError) {
    return <div className="max-w-5xl mx-auto mt-16 p-6 text-red-400">Failed to load users: {loadError}</div>
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        {canAdd && (
          <button
            onClick={() => setShowAddForm(v => !v)}
            className="bg-sky-400 text-[#111314] px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-400/90"
          >
            {showAddForm ? 'Cancel' : '+ Add user'}
          </button>
        )}
      </div>

      {/* Add user form */}
      {showAddForm && (
        <form onSubmit={handleAdd} className="mb-6 p-5 border border-[#2A2D30] rounded-[20px] bg-[#1C1F21] flex flex-col gap-3">
          <h2 className="font-semibold text-slate-100">New user</h2>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="email" placeholder="Email address" required value={addEmail}
              onChange={e => setAddEmail(e.target.value)}
              className="bg-[#111314] border border-[#2A2D30] rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 w-full focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400/50 transition-colors"
            />
            <input
              type="password" placeholder="Temporary password (min 6 chars)" required minLength={6} value={addPassword}
              onChange={e => setAddPassword(e.target.value)}
              className="bg-[#111314] border border-[#2A2D30] rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 w-full focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400/50 transition-colors"
            />
          </div>
          {addError && <p className="text-red-400 text-sm">{addError}</p>}
          <div>
            <button
              type="submit" disabled={addLoading}
              className="bg-sky-400 text-[#111314] px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-400/90 disabled:opacity-50"
            >
              {addLoading ? 'Creating…' : 'Create user'}
            </button>
          </div>
        </form>
      )}

      {/* User table */}
      <div className="bg-[#1C1F21] border border-[#2A2D30] rounded-[20px] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#111314]/50 border-b border-[#2A2D30]">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">User</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Permissions</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Joined</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b last:border-0 hover:bg-sky-400/5 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-100">{u.displayName ?? u.email}</div>
                  {u.displayName && <div className="text-slate-500 text-xs">{u.email}</div>}
                  {!u.emailConfirmed && (
                    <span className="text-xs text-amber-400 font-medium">unverified</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    u.status === 'suspended' ? 'bg-red-500/15 text-red-400' : 'bg-emerald-400/15 text-emerald-400'
                  }`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {u.permissions.length === 0
                      ? <span className="text-slate-500 text-xs">none</span>
                      : u.permissions.map(p => (
                        <span key={p} className="bg-sky-400/10 text-sky-400 text-xs px-1.5 py-0.5 rounded-md font-medium">
                          {p.replace('usermanage:', '')}
                        </span>
                      ))
                    }
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => openManage(u)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-[#2A2D30] text-slate-500 hover:bg-sky-400/5 font-medium transition-colors"
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-slate-500">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Manage modal */}
      {target && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1C1F21] border border-[#2A2D30] rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">

            {/* Header */}
            <div className="px-6 py-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-sky-400/15 border border-sky-400/30 flex items-center justify-center text-base font-semibold text-sky-400 shrink-0 select-none">
                {(target.displayName ?? target.email ?? '?').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-100 leading-tight truncate">
                  {target.displayName ?? target.email}
                </p>
                {target.displayName && (
                  <p className="text-sm text-slate-500 truncate">{target.email}</p>
                )}
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                target.status === 'suspended' ? 'bg-red-500/15 text-red-400' : 'bg-emerald-400/15 text-emerald-400'
              }`}>
                {target.status}
              </span>
              <button onClick={closeManage} className="text-slate-500 hover:text-slate-100 transition-colors shrink-0 ml-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 divide-y divide-[#2A2D30]/50">

              {/* Profile */}
              <section className="px-6 py-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Profile</p>
                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-100 mb-1.5">Display name</label>
                      <input
                        type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                        placeholder="Display name" disabled={readOnly}
                        className="bg-[#111314] border border-[#2A2D30] rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 w-full focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400/50 transition-colors disabled:bg-[#111314]/50 disabled:text-slate-500 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-100 mb-1.5">Avatar URL</label>
                      <input
                        type="url" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)}
                        placeholder="https://…" disabled={readOnly}
                        className="bg-[#111314] border border-[#2A2D30] rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 w-full focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400/50 transition-colors disabled:bg-[#111314]/50 disabled:text-slate-500 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                  {profileError && <p className="text-red-400 text-sm">{profileError}</p>}
                  {!readOnly && (
                    <div className="flex items-center gap-3">
                      <button type="submit" disabled={profileLoading}
                        className="bg-sky-400 text-[#111314] px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-400/90 disabled:opacity-50">
                        {profileLoading ? 'Saving…' : 'Save changes'}
                      </button>
                      {profileSuccess && <span className="text-sm text-emerald-400 font-medium">✓ Saved</span>}
                    </div>
                  )}
                </form>
              </section>

              {/* Authentication */}
              <section className="px-6 py-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Authentication</p>
                <div className="space-y-5">

                  {/* Email verification row */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-100">Email verification</p>
                      <p className="text-xs text-slate-500 mt-0.5">{target.email}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        target.emailConfirmed ? 'bg-emerald-400/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                      }`}>
                        {target.emailConfirmed ? '✓ Verified' : 'Unverified'}
                      </span>
                      {!readOnly && (target.emailConfirmed ? (
                        <button onClick={handleUnverify} disabled={unverifyLoading}
                          className="text-xs px-3 py-1.5 rounded-lg border border-[#2A2D30] text-slate-500 hover:bg-sky-400/5 disabled:opacity-50 font-medium">
                          {unverifyLoading ? '…' : 'Revoke'}
                        </button>
                      ) : (
                        <>
                          <button onClick={handleVerify} disabled={verifyLoading}
                            className="text-xs px-3 py-1.5 rounded-lg border border-emerald-400/40 text-emerald-400 hover:bg-emerald-400/10 disabled:opacity-50 font-medium">
                            {verifyLoading ? '…' : 'Mark verified'}
                          </button>
                          <button onClick={handleResendVerification} disabled={resendLoading}
                            className="text-xs px-3 py-1.5 rounded-lg border border-[#2A2D30] text-slate-500 hover:bg-sky-400/5 disabled:opacity-50 font-medium">
                            {resendLoading ? '…' : 'Resend email'}
                          </button>
                          {resendSuccess && <span className="text-xs text-emerald-400 font-medium">✓ Sent</span>}
                        </>
                      ))}
                    </div>
                  </div>

                  {/* Magic link row — only shown to admins who can act */}
                  {!readOnly && (
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-100">Magic login link</p>
                        <p className="text-xs text-slate-500 mt-0.5">Send a one-time passwordless sign-in link</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={handleMagicLink} disabled={magicLinkLoading}
                          className="text-xs px-3 py-1.5 rounded-lg border border-[#2A2D30] text-slate-500 hover:bg-sky-400/5 disabled:opacity-50 font-medium">
                          {magicLinkLoading ? 'Sending…' : 'Send link'}
                        </button>
                        {magicLinkSuccess && <span className="text-xs text-emerald-400 font-medium">✓ Sent</span>}
                      </div>
                    </div>
                  )}

                </div>
              </section>

              {/* Account access */}
              {canActOnTarget && (
                <section className="px-6 py-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Account access</p>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-100">Login access</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {target.status === 'suspended'
                          ? 'This user is blocked from signing in'
                          : 'This user can sign in normally'}
                      </p>
                    </div>
                    {(canSuspend || (canSelfManage && isSelf)) && (
                      <button onClick={handleSuspendToggle} disabled={suspendLoading}
                        className={`shrink-0 text-xs px-4 py-2 rounded-lg border font-medium disabled:opacity-50 transition-colors ${
                          target.status === 'suspended'
                            ? 'border-emerald-400/40 text-emerald-400 hover:bg-emerald-400/10'
                            : 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                        }`}>
                        {suspendLoading ? '…' : target.status === 'suspended' ? 'Restore access' : 'Suspend access'}
                      </button>
                    )}
                  </div>
                </section>
              )}

              {/* Security */}
              {(canResetPassword || (canSelfManage && isSelf)) && canActOnTarget && (
                <section className="px-6 py-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Security</p>
                  <form onSubmit={handlePasswordSave} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-100 mb-1.5">Set new password</label>
                      <div className="flex gap-3">
                        <input
                          type="password" required minLength={6} value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          className="bg-[#111314] border border-[#2A2D30] rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 flex-1 focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400/50 transition-colors"
                        />
                        <button type="submit" disabled={pwdLoading}
                          className="bg-sky-400 text-[#111314] px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-400/90 disabled:opacity-50 whitespace-nowrap">
                          {pwdLoading ? 'Saving…' : 'Set password'}
                        </button>
                      </div>
                    </div>
                    {pwdError && <p className="text-red-400 text-sm">{pwdError}</p>}
                    {pwdSuccess && <p className="text-sm text-emerald-400 font-medium">✓ Password updated</p>}
                  </form>
                </section>
              )}

              {/* Permissions */}
              {canActOnTarget && (
                <section className="px-6 py-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Permissions</p>
                  <form onSubmit={handlePermSave} className="space-y-1">
                    {PERMISSION_META.map(({ key, label, description }) => (
                      <div key={key} className="flex items-center justify-between py-2.5">
                        <div>
                          <p className="text-sm font-medium text-slate-100">{label}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                        </div>
                        <button
                          type="button"
                          disabled={!(canEditPermissions || (canSelfManage && isSelf))}
                          onClick={() => (canEditPermissions || (canSelfManage && isSelf)) && setPermSelection(prev =>
                            prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key]
                          )}
                          className={`relative inline-flex h-6 w-11 shrink-0 ml-6 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:cursor-not-allowed disabled:opacity-60 ${
                            permSelection.includes(key) ? 'bg-sky-400' : 'bg-[#2A2D30]'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                            permSelection.includes(key) ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    ))}
                    {permError && <p className="text-red-400 text-sm pt-2">{permError}</p>}
                    {(canEditPermissions || (canSelfManage && isSelf)) && (
                      <div className="flex items-center gap-3 pt-3">
                        <button type="submit" disabled={permLoading}
                          className="bg-sky-400 text-[#111314] px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-400/90 disabled:opacity-50">
                          {permLoading ? 'Saving…' : 'Save permissions'}
                        </button>
                        {permSuccess && <span className="text-sm text-emerald-400 font-medium">✓ Saved</span>}
                      </div>
                    )}
                  </form>
                </section>
              )}

              {/* Danger zone */}
              {(canDelete || (canSelfManage && isSelf)) && canActOnTarget && (
                <section className="px-6 py-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-red-400 mb-4">Danger zone</p>
                  {!deleteConfirm ? (
                    <div className="flex items-center justify-between p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                      <div>
                        <p className="text-sm font-medium text-red-300">Delete this account</p>
                        <p className="text-xs text-red-400 mt-0.5">Permanently removes the user and all their data</p>
                      </div>
                      <button onClick={() => setDeleteConfirm(true)}
                        className="shrink-0 ml-4 text-sm px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 font-medium transition-colors">
                        Delete user
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 space-y-3">
                      <p className="text-sm font-semibold text-red-300">This cannot be undone</p>
                      <p className="text-sm text-red-400">
                        Permanently delete <strong>{target.email}</strong> and all associated data?
                      </p>
                      <div className="flex gap-2">
                        <button onClick={handleDelete} disabled={deleteLoading}
                          className="text-sm px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 font-medium">
                          {deleteLoading ? 'Deleting…' : 'Yes, delete permanently'}
                        </button>
                        <button onClick={() => setDeleteConfirm(false)}
                          className="text-sm px-4 py-2 rounded-lg border border-[#2A2D30] bg-[#1C1F21] hover:bg-sky-400/5 text-slate-500 font-medium">
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </section>
              )}

            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-[#111314]/30 rounded-b-2xl flex justify-end">
              <button onClick={closeManage}
                className="px-4 py-2 rounded-lg border border-[#2A2D30] text-sm text-slate-500 hover:bg-sky-400/5 font-medium transition-colors">
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

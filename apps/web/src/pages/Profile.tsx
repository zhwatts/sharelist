import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { updateProfile, isError } from '../lib/api'

export function Profile() {
  const { user, signOut, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!user) return null

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)
    const result = await updateProfile(user.id, {
      display_name: displayName,
      avatar_url: avatarUrl || undefined,
    })
    setLoading(false)
    if (isError(result)) { setError(result.error.message); return }
    await refreshUser()
    setSuccess(true)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/signin')
  }

  const initials = (user.displayName ?? user.email ?? '?').charAt(0).toUpperCase()

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      {/* Avatar + identity */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-full bg-sky-400/15 border border-sky-400/30 flex items-center justify-center text-xl font-bold text-sky-400 select-none shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-lg font-semibold text-slate-100 truncate">{user.displayName ?? user.email}</p>
          {user.displayName && <p className="text-sm text-slate-500 truncate">{user.email}</p>}
        </div>
      </div>

      {/* Profile card */}
      <div className="bg-[#1C1F21] border border-[#2A2D30] rounded-[20px] p-6 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-5">Profile</p>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-100 mb-1.5">Display name</label>
            <input
              type="text" value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder={user.email?.split('@')[0]}
              className="bg-[#111314] border border-[#2A2D30] rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 w-full focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-100 mb-1.5">Avatar URL</label>
            <input
              type="url" value={avatarUrl} placeholder="https://…"
              onChange={e => setAvatarUrl(e.target.value)}
              className="bg-[#111314] border border-[#2A2D30] rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 w-full focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400/50 transition-colors"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {success && <p className="text-emerald-400 text-sm font-medium">✓ Saved</p>}
          <button
            type="submit" disabled={loading}
            className="bg-sky-400 text-[#111314] py-2.5 rounded-xl text-sm font-semibold hover:bg-sky-400/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>

      <button
        onClick={handleSignOut}
        className="mt-6 text-sm text-slate-500 hover:text-red-400 transition-colors"
      >
        Sign out
      </button>
    </div>
  )
}

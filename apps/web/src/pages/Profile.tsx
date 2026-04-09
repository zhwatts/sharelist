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

  return (
    <div className="max-w-md mx-auto mt-16 p-6">
      <h1 className="text-2xl font-bold mb-2">Profile</h1>
      <p className="text-gray-500 text-sm mb-6">{user.email}</p>
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Display name</label>
          <input
            type="text" value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
          <input
            type="url" value={avatarUrl} placeholder="https://…"
            onChange={e => setAvatarUrl(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">Saved.</p>}
        <button type="submit" disabled={loading} className="bg-gray-900 text-white py-2 rounded hover:bg-gray-700 disabled:opacity-50">
          {loading ? 'Saving…' : 'Save changes'}
        </button>
      </form>
      <button onClick={handleSignOut} className="mt-6 text-sm text-gray-500 hover:text-gray-900 underline">
        Sign out
      </button>
    </div>
  )
}

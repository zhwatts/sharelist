import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { confirmPasswordReset, isError } from '../lib/api'

export function PasswordResetConfirm() {
  const navigate = useNavigate()
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Supabase redirects here with tokens in the URL hash:
  // #access_token=...&refresh_token=...&type=recovery
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    const params = new URLSearchParams(hash)
    const token = params.get('access_token')
    const type = params.get('type')
    if (token && type === 'recovery') {
      setAccessToken(token)
      // Clean the hash from the URL without triggering a navigation
      window.history.replaceState(null, '', window.location.pathname)
    } else {
      setError('Invalid or missing reset token. Please request a new reset link.')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accessToken) return
    setError(null)
    setLoading(true)
    const result = await confirmPasswordReset(accessToken, password)
    setLoading(false)
    if (isError(result)) { setError(result.error.message); return }
    navigate('/signin')
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6">
      <h1 className="text-2xl font-bold mb-6">Set new password</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="password" placeholder="New password (min 6 chars)" value={password} required minLength={6}
          onChange={e => setPassword(e.target.value)}
          disabled={!accessToken}
          className="border rounded px-3 py-2 w-full disabled:opacity-50"
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={loading || !accessToken} className="bg-gray-900 text-white py-2 rounded hover:bg-gray-700 disabled:opacity-50">
          {loading ? 'Updating…' : 'Set new password'}
        </button>
      </form>
    </div>
  )
}

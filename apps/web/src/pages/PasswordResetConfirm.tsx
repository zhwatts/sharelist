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
    window.history.replaceState(null, '', window.location.pathname)
    navigate('/signin')
  }

  return (
    <div className="min-h-[calc(100vh-57px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1C1F21] border border-[#2A2D30] rounded-[20px] p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-slate-100 mb-1">Set new password</h1>
        <p className="text-sm text-slate-500 mb-8">Choose a strong password for your account</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-100 mb-1.5">New password</label>
            <input
              type="password" placeholder="Min 6 characters" value={password} required minLength={6}
              onChange={e => setPassword(e.target.value)}
              disabled={!accessToken}
              className="bg-[#111314] border border-[#2A2D30] rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 w-full focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit" disabled={loading || !accessToken}
            className="bg-sky-400 text-[#111314] py-2.5 rounded-xl text-sm font-semibold hover:bg-sky-400/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors mt-1"
          >
            {loading ? 'Updating…' : 'Set new password'}
          </button>
        </form>
      </div>
    </div>
  )
}

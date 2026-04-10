import { useState } from 'react'
import { Link } from 'react-router-dom'
import { requestPasswordReset, isError } from '../lib/api'

export function PasswordResetRequest() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const redirectTo = `${window.location.origin}/reset-password`
    const result = await requestPasswordReset(email, redirectTo)
    setLoading(false)
    if (isError(result)) { setError(result.error.message); return }
    setSent(true)
  }

  return (
    <div className="min-h-[calc(100vh-57px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1C1F21] border border-[#2A2D30] rounded-[20px] p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-slate-100 mb-1">Reset password</h1>
        <p className="text-sm text-slate-500 mb-8">We'll send a reset link to your email</p>

        {sent ? (
          <p className="text-emerald-400 text-sm font-medium">Check your email for a reset link.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-100 mb-1.5">Email</label>
              <input
                type="email" placeholder="you@example.com" value={email} required
                onChange={e => setEmail(e.target.value)}
                className="bg-[#111314] border border-[#2A2D30] rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 w-full focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400/50 transition-colors"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit" disabled={loading}
              className="bg-sky-400 text-[#111314] py-2.5 rounded-xl text-sm font-semibold hover:bg-sky-400/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors mt-1"
            >
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}

        <p className="mt-6 text-sm">
          <Link to="/signin" className="text-slate-500 hover:text-sky-400 transition-colors">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

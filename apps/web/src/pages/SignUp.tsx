import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function SignUp() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const err = await signUp(email, password)
    setLoading(false)
    if (err) { setError(err); return }
    setSuccess(true)
    setTimeout(() => navigate('/profile'), 1000)
  }

  return (
    <div className="min-h-[calc(100vh-57px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-sl-surface border border-sl-border rounded-[20px] p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-sl-text mb-1">Create account</h1>
        <p className="text-sm text-sl-muted mb-8">Join ShareList and start sharing playlists</p>

        {success ? (
          <p className="text-sl-mint text-sm font-medium">Account created! Redirecting…</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-sl-text mb-1.5">Email</label>
              <input
                type="email" placeholder="you@example.com" value={email} required
                onChange={e => setEmail(e.target.value)}
                className="bg-sl-bg border border-sl-border rounded-xl px-4 py-2.5 text-sm text-sl-text placeholder:text-sl-muted w-full focus:outline-none focus:ring-2 focus:ring-sl-accent/50 focus:border-sl-accent/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-sl-text mb-1.5">Password</label>
              <input
                type="password" placeholder="Min 6 characters" value={password} required minLength={6}
                onChange={e => setPassword(e.target.value)}
                className="bg-sl-bg border border-sl-border rounded-xl px-4 py-2.5 text-sm text-sl-text placeholder:text-sl-muted w-full focus:outline-none focus:ring-2 focus:ring-sl-accent/50 focus:border-sl-accent/50 transition-colors"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit" disabled={loading}
              className="bg-sl-accent text-sl-bg py-2.5 rounded-xl text-sm font-semibold hover:bg-sl-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors mt-1"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        )}

        <p className="mt-6 text-sm">
          <Link to="/signin" className="text-sl-muted hover:text-sl-accent transition-colors">
            Already have an account? <span className="text-sl-accent">Sign in</span>
          </Link>
        </p>
      </div>
    </div>
  )
}

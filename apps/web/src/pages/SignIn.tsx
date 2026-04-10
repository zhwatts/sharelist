import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function SignIn() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const err = await signIn(email, password)
    setLoading(false)
    if (err) { setError(err); return }
    navigate('/profile')
  }

  return (
    <div className="min-h-[calc(100vh-57px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1C1F21] border border-[#2A2D30] rounded-[20px] p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-slate-100 mb-1">Welcome back</h1>
        <p className="text-sm text-slate-500 mb-8">Sign in to your ShareList account</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-100 mb-1.5">Email</label>
            <input
              type="email" placeholder="you@example.com" value={email} required
              onChange={e => setEmail(e.target.value)}
              className="bg-[#111314] border border-[#2A2D30] rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 w-full focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-100 mb-1.5">Password</label>
            <input
              type="password" placeholder="••••••••" value={password} required
              onChange={e => setPassword(e.target.value)}
              className="bg-[#111314] border border-[#2A2D30] rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 w-full focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400/50 transition-colors"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit" disabled={loading}
            className="bg-sky-400 text-[#111314] py-2.5 rounded-xl text-sm font-semibold hover:bg-sky-400/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors mt-1"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-2 text-sm">
          <Link to="/signup" className="text-slate-500 hover:text-sky-400 transition-colors">
            No account? <span className="text-sky-400">Sign up</span>
          </Link>
          <Link to="/forgot-password" className="text-slate-500 hover:text-sky-400 transition-colors">
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  )
}

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
    <div className="max-w-md mx-auto mt-16 p-6">
      <h1 className="text-2xl font-bold mb-6">Sign in</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email" placeholder="Email" value={email} required
          onChange={e => setEmail(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
        <input
          type="password" placeholder="Password" value={password} required
          onChange={e => setPassword(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="bg-gray-900 text-white py-2 rounded hover:bg-gray-700 disabled:opacity-50">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <div className="mt-4 text-sm text-gray-600 flex flex-col gap-1">
        <Link to="/signup" className="hover:underline">No account? Sign up</Link>
        <Link to="/forgot-password" className="hover:underline">Forgot password?</Link>
      </div>
    </div>
  )
}

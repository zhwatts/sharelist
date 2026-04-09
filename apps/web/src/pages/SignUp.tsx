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
    // If Supabase requires email confirmation there's no session yet — show message
    // If session was created immediately, signUp already set user and we can redirect
    setSuccess(true)
    setTimeout(() => navigate('/profile'), 1000)
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6">
      <h1 className="text-2xl font-bold mb-6">Create account</h1>
      {success ? (
        <p className="text-green-600">Account created! Redirecting…</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email" placeholder="Email" value={email} required
            onChange={e => setEmail(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />
          <input
            type="password" placeholder="Password (min 6 chars)" value={password} required minLength={6}
            onChange={e => setPassword(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="bg-gray-900 text-white py-2 rounded hover:bg-gray-700 disabled:opacity-50">
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      )}
      <p className="mt-4 text-sm text-gray-600">
        <Link to="/signin" className="hover:underline">Already have an account? Sign in</Link>
      </p>
    </div>
  )
}

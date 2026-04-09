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
    <div className="max-w-md mx-auto mt-16 p-6">
      <h1 className="text-2xl font-bold mb-6">Reset password</h1>
      {sent ? (
        <p className="text-green-600">Check your email for a reset link.</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email" placeholder="Email" value={email} required
            onChange={e => setEmail(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="bg-gray-900 text-white py-2 rounded hover:bg-gray-700 disabled:opacity-50">
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}
      <p className="mt-4 text-sm text-gray-600">
        <Link to="/signin" className="hover:underline">Back to sign in</Link>
      </p>
    </div>
  )
}

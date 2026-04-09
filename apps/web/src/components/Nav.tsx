import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Nav() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/signin')
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <Link to="/" className="font-bold text-gray-900">ShareList</Link>
      <div className="flex items-center gap-4 text-sm">
        {user ? (
          <>
            <Link to="/profile" className="text-gray-600 hover:text-gray-900">{user.email}</Link>
            <button onClick={handleSignOut} className="text-gray-500 hover:text-gray-900">Sign out</button>
          </>
        ) : (
          <>
            <Link to="/signin" className="text-gray-600 hover:text-gray-900">Sign in</Link>
            <Link to="/signup" className="bg-gray-900 text-white px-3 py-1 rounded hover:bg-gray-700">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  )
}

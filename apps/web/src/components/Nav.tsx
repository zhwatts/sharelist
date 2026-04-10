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
    <nav className="bg-sl-nav border-b border-sl-border px-6 py-3.5 flex items-center justify-between sticky top-0 z-50">
      <Link to="/" className="text-base tracking-tight">
        <span className="font-light text-sl-text">Share</span><span className="font-bold text-sl-accent">List</span>
      </Link>
      <div className="flex items-center gap-5 text-sm">
        {user ? (
          <>
            {user.permissions.includes('usermanage:listusers') && (
              <Link to="/admin/users" className="text-sl-muted hover:text-sl-text transition-colors">Users</Link>
            )}
            <Link to="/profile" className="text-sl-muted hover:text-sl-text transition-colors truncate max-w-[160px]">{user.email}</Link>
            <button onClick={handleSignOut} className="text-sl-muted hover:text-red-400 transition-colors">Sign out</button>
          </>
        ) : (
          <>
            <Link to="/signin" className="text-sl-muted hover:text-sl-text transition-colors">Sign in</Link>
            <Link to="/signup" className="bg-sl-accent text-sl-bg px-3.5 py-1.5 rounded-xl text-sm font-semibold hover:bg-sl-accent/90 transition-colors">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  )
}

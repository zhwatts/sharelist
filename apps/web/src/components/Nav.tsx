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
    <nav className="bg-[#161819] border-b border-[#2A2D30] px-6 py-3.5 flex items-center justify-between sticky top-0 z-50">
      <Link to="/" className="text-base tracking-tight">
        <span className="font-light text-slate-100">Share</span><span className="font-bold text-sky-400">List</span>
      </Link>
      <div className="flex items-center gap-5 text-sm">
        {user ? (
          <>
            {user.permissions.includes('usermanage:listusers') && (
              <Link to="/admin/users" className="text-slate-500 hover:text-slate-100 transition-colors">Users</Link>
            )}
            <Link to="/profile" className="text-slate-500 hover:text-slate-100 transition-colors truncate max-w-[160px]">{user.email}</Link>
            <button onClick={handleSignOut} className="text-slate-500 hover:text-red-400 transition-colors">Sign out</button>
          </>
        ) : (
          <>
            <Link to="/signin" className="text-slate-500 hover:text-slate-100 transition-colors">Sign in</Link>
            <Link to="/signup" className="bg-sky-400 text-[#111314] px-3.5 py-1.5 rounded-xl text-sm font-semibold hover:bg-sky-400/90 transition-colors">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  )
}

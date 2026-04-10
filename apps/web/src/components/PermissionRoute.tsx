import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'

interface Props {
  permission: string
  children: ReactNode
}

export function PermissionRoute({ permission, children }: Props) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading…</div>
  if (!user) return <Navigate to="/signin" replace />
  if (!user.permissions.includes(permission)) return <Navigate to="/" replace />
  return <>{children}</>
}

import { Routes, Route, Navigate } from 'react-router-dom'
import { Nav } from './components/Nav'
import { ProtectedRoute } from './components/ProtectedRoute'
import { PermissionRoute } from './components/PermissionRoute'
import { SignIn } from './pages/SignIn'
import { SignUp } from './pages/SignUp'
import { PasswordResetRequest } from './pages/PasswordResetRequest'
import { PasswordResetConfirm } from './pages/PasswordResetConfirm'
import { Profile } from './pages/Profile'
import { AdminUsers } from './pages/AdminUsers'

function App() {
  return (
    <div className="min-h-screen bg-[#111314] font-sans" style={{ backgroundImage: 'radial-gradient(circle at 20% 10%, rgba(56,189,248,0.06) 0%, rgba(56,189,248,0.02) 40%, transparent 70%)' }}>
      <Nav />
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<PasswordResetRequest />} />
        <Route path="/reset-password" element={<PasswordResetConfirm />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route
          path="/admin/users"
          element={
            <PermissionRoute permission="usermanage:listusers">
              <AdminUsers />
            </PermissionRoute>
          }
        />
        <Route path="/" element={<Navigate to="/profile" replace />} />
      </Routes>
    </div>
  )
}

export default App

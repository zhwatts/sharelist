import { ConfigProvider, theme } from 'antd'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Nav } from './components/Nav'
import { ProtectedRoute } from './components/ProtectedRoute'
import { PermissionRoute } from './components/PermissionRoute'
import { SignIn } from './pages/SignIn'
import { SignUp } from './pages/SignUp'
import { PasswordResetRequest } from './pages/PasswordResetRequest'
import { PasswordResetConfirm } from './pages/PasswordResetConfirm'
import { MagicLinkConfirm } from './pages/MagicLinkConfirm'
import { Profile } from './pages/Profile'
import { AdminUsers } from './pages/AdminUsers'

const SL = {
  bg: '#111314',
  surface: '#1C1F21',
  nav: '#161819',
  border: '#2A2D30',
  accent: '#38BDF8',
  mint: '#4ADE80',
  text: '#F1F5F9',
  muted: '#64748B',
}

function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: SL.accent,
          colorBgBase: SL.bg,
          colorBgContainer: SL.surface,
          colorBorder: SL.border,
          colorText: SL.text,
          colorTextSecondary: SL.muted,
          fontFamily: 'Inter, system-ui, sans-serif',
          borderRadius: 8,
        },
        components: {
          Button: { primaryColor: SL.accent },
          Badge: { dotSize: 8 },
          Progress: { circleTextColor: SL.text },
          Form: { labelColor: SL.text },
          Input: { colorTextPlaceholder: SL.muted },
          Table: {
            headerBg: 'rgba(28, 31, 33, 0.6)',
            headerColor: '#94A3B8',
            rowHoverBg: 'rgba(56, 189, 248, 0.05)',
            borderColor: SL.border,
          },
          Drawer: {
            colorBgElevated: SL.bg,
            colorText: SL.text,
          },
          Modal: {
            contentBg: 'rgba(17, 19, 20, 0.98)',
            headerBg: 'rgba(17, 19, 20, 0.98)',
            borderRadiusLG: 16,
          },
        },
      }}
    >
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: SL.bg,
          fontFamily: 'Inter, system-ui, sans-serif',
          backgroundImage:
            'radial-gradient(circle at 20% 10%, rgba(56,189,248,0.06) 0%, rgba(56,189,248,0.02) 40%, transparent 70%)',
        }}
      >
        <Nav />
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<PasswordResetRequest />} />
          <Route path="/reset-password" element={<PasswordResetConfirm />} />
          <Route path="/magic-link" element={<MagicLinkConfirm />} />
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
    </ConfigProvider>
  )
}

export default App

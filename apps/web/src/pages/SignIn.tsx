import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Flex, Form, Input, Typography, Alert } from 'antd'
import { useAuth } from '../context/AuthContext'

const SL = {
  surface: '#1C1F21',
  border: '#2A2D30',
  accent: '#38BDF8',
  text: '#F1F5F9',
  muted: '#64748B',
}

export function SignIn() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFinish = async (values: { email: string; password: string }) => {
    setError(null)
    setLoading(true)
    const err = await signIn(values.email, values.password)
    setLoading(false)
    if (err) { setError(err); return }
    navigate('/profile')
  }

  return (
    <Flex justify="center" align="center" style={{ minHeight: 'calc(100vh - 57px)', padding: 16 }}>
      <div
        style={{
          width: '100%',
          maxWidth: 448,
          backgroundColor: SL.surface,
          border: `1px solid ${SL.border}`,
          borderRadius: 20,
          padding: 32,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        }}
      >
        <Typography.Title level={3} style={{ color: SL.text, marginBottom: 4, marginTop: 0 }}>
          Welcome back
        </Typography.Title>
        <Typography.Text style={{ color: SL.muted, fontSize: 14, display: 'block', marginBottom: 32 }}>
          Sign in to your ShareList account
        </Typography.Text>

        <Form layout="vertical" onFinish={handleFinish} requiredMark={false}>
          <Form.Item
            name="email"
            label={<span style={{ color: SL.text, fontSize: 14, fontWeight: 500 }}>Email</span>}
            rules={[{ required: true, type: 'email' }]}
          >
            <Input placeholder="you@example.com" size="large" style={{ borderRadius: 12 }} />
          </Form.Item>

          <Form.Item
            name="password"
            label={<span style={{ color: SL.text, fontSize: 14, fontWeight: 500 }}>Password</span>}
            rules={[{ required: true }]}
          >
            <Input.Password placeholder="••••••••" size="large" style={{ borderRadius: 12 }} />
          </Form.Item>

          {error && (
            <Form.Item>
              <Alert message={error} type="error" showIcon style={{ borderRadius: 10 }} />
            </Form.Item>
          )}

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              block
              style={{ borderRadius: 12, fontWeight: 600 }}
            >
              Sign in
            </Button>
          </Form.Item>
        </Form>

        <Flex vertical gap={8} style={{ marginTop: 24 }}>
          <Link to="/signup" style={{ color: SL.muted, fontSize: 14, textDecoration: 'none' }}>
            No account?{' '}
            <span style={{ color: SL.accent }}>Sign up</span>
          </Link>
          <Link to="/forgot-password" style={{ color: SL.muted, fontSize: 14, textDecoration: 'none' }}>
            Forgot password?
          </Link>
        </Flex>
      </div>
    </Flex>
  )
}

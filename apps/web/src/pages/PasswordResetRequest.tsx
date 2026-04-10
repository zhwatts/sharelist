import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Flex, Form, Input, Typography, Alert } from 'antd'
import { requestPasswordReset, isError } from '../lib/api'

const SL = {
  surface: '#1C1F21',
  border: '#2A2D30',
  accent: '#38BDF8',
  text: '#F1F5F9',
  muted: '#64748B',
}

export function PasswordResetRequest() {
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleFinish = async (values: { email: string }) => {
    setError(null)
    setLoading(true)
    const redirectTo = `${window.location.origin}/reset-password`
    const result = await requestPasswordReset(values.email, redirectTo)
    setLoading(false)
    if (isError(result)) { setError(result.error.message); return }
    setSent(true)
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
          Reset password
        </Typography.Title>
        <Typography.Text style={{ color: SL.muted, fontSize: 14, display: 'block', marginBottom: 32 }}>
          We'll send a reset link to your email
        </Typography.Text>

        {sent ? (
          <Alert
            message="Check your email for a reset link."
            type="success"
            showIcon
            style={{ borderRadius: 10 }}
          />
        ) : (
          <Form layout="vertical" onFinish={handleFinish} requiredMark={false}>
            <Form.Item
              name="email"
              label={<span style={{ color: SL.text, fontSize: 14, fontWeight: 500 }}>Email</span>}
              rules={[{ required: true, type: 'email' }]}
            >
              <Input placeholder="you@example.com" size="large" style={{ borderRadius: 12 }} />
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
                Send reset link
              </Button>
            </Form.Item>
          </Form>
        )}

        <div style={{ marginTop: 24 }}>
          <Link to="/signin" style={{ color: SL.muted, fontSize: 14, textDecoration: 'none' }}>
            ← Back to sign in
          </Link>
        </div>
      </div>
    </Flex>
  )
}

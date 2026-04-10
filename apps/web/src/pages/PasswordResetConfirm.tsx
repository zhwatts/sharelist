import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Flex, Form, Input, Typography, Alert } from 'antd'
import { confirmPasswordReset, isError } from '../lib/api'

const SL = {
  surface: '#1C1F21',
  border: '#2A2D30',
  text: '#F1F5F9',
  muted: '#64748B',
}

export function PasswordResetConfirm() {
  const navigate = useNavigate()
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    const params = new URLSearchParams(hash)
    const token = params.get('access_token')
    const type = params.get('type')
    if (token && type === 'recovery') {
      setAccessToken(token)
    } else {
      setError('Invalid or missing reset token. Please request a new reset link.')
    }
  }, [])

  const handleFinish = async (values: { password: string }) => {
    if (!accessToken) return
    setError(null)
    setLoading(true)
    const result = await confirmPasswordReset(accessToken, values.password)
    setLoading(false)
    if (isError(result)) { setError(result.error.message); return }
    window.history.replaceState(null, '', window.location.pathname)
    navigate('/signin')
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
          Set new password
        </Typography.Title>
        <Typography.Text style={{ color: SL.muted, fontSize: 14, display: 'block', marginBottom: 32 }}>
          Choose a strong password for your account
        </Typography.Text>

        <Form layout="vertical" onFinish={handleFinish} requiredMark={false}>
          <Form.Item
            name="password"
            label={<span style={{ color: SL.text, fontSize: 14, fontWeight: 500 }}>New password</span>}
            rules={[{ required: true, min: 6, message: 'Minimum 6 characters' }]}
          >
            <Input.Password
              placeholder="Min 6 characters"
              size="large"
              disabled={!accessToken}
              style={{ borderRadius: 12 }}
            />
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
              disabled={!accessToken}
              block
              style={{ borderRadius: 12, fontWeight: 600 }}
            >
              Set new password
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Flex>
  )
}

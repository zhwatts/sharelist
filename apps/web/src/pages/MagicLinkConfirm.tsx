import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flex, Spin, Typography, Alert, Button } from 'antd'
import { storeToken } from '../lib/api'
import { useAuth } from '../context/AuthContext'

const SL = {
  surface: '#1C1F21',
  border: '#2A2D30',
  text: '#F1F5F9',
  muted: '#64748B',
}

export function MagicLinkConfirm() {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    const params = new URLSearchParams(hash)
    const token = params.get('access_token')
    const type = params.get('type')

    if (!token || type !== 'magiclink') {
      setError('Invalid or missing magic link token. Please request a new link.')
      return
    }

    // Clear the tokens from the URL bar before doing anything
    window.history.replaceState(null, '', window.location.pathname)

    storeToken(token)

    refreshUser().then(() => {
      navigate('/profile', { replace: true })
    }).catch(() => {
      setError('Failed to sign in. The link may have expired — please request a new one.')
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
          textAlign: 'center',
        }}
      >
        {error ? (
          <Flex vertical gap={16} align="center">
            <Alert message={error} type="error" showIcon style={{ borderRadius: 10, width: '100%' }} />
            <Button onClick={() => navigate('/signin')} style={{ borderRadius: 10 }}>
              Back to sign in
            </Button>
          </Flex>
        ) : (
          <Flex vertical gap={16} align="center">
            <Spin size="large" />
            <Typography.Text style={{ color: SL.muted, fontSize: 14 }}>
              Signing you in…
            </Typography.Text>
          </Flex>
        )}
      </div>
    </Flex>
  )
}

/**
 * LinkPlaylistModal — links a third-party playlist to an existing ShareList.
 *
 * Flow:
 *   1. User selects a connected service.
 *   2. Playlists are fetched from that service.
 *   3. User picks a playlist.
 *   4. POST /sharelists/:id/links → calls onLinked on success.
 */

import { useEffect, useState } from 'react'
import { Modal, Select, Button, Typography, Flex, Space, Divider, Spin, Empty, notification } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpotify, faApple } from '@fortawesome/free-brands-svg-icons'
import { CheckCircleOutlined, LoadingOutlined, LinkOutlined } from '@ant-design/icons'
import * as api from '../lib/api'
import type { ConnectedService, StreamingPlaylist } from '../lib/api'

const { Text, Title } = Typography

const PROVIDER_META: Record<string, { label: string; icon: typeof faSpotify; color: string }> = {
  spotify:     { label: 'Spotify',     icon: faSpotify, color: '#1DB954' },
  apple_music: { label: 'Apple Music', icon: faApple,   color: '#FA243C' },
}

interface LinkPlaylistModalProps {
  sharelistId: string
  onClose: () => void
  onLinked: () => void
}

export function LinkPlaylistModal({ sharelistId, onClose, onLinked }: LinkPlaylistModalProps) {
  const [notifyApi, contextHolder] = notification.useNotification()

  const [connected, setConnected]         = useState<ConnectedService[]>([])
  const [servicesLoading, setSvcLoading]  = useState(true)

  const [selectedService, setService]         = useState<string>('')
  const [playlists, setPlaylists]             = useState<StreamingPlaylist[]>([])
  const [playlistsLoading, setPlLoading]      = useState(false)
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>('')
  const [linking, setLinking]                 = useState(false)

  // Load connected services on open
  useEffect(() => {
    void (async () => {
      const result = await api.getConnectedServices()
      setSvcLoading(false)
      if (!api.isError(result)) setConnected(result.data)
    })()
  }, [])

  // Fetch playlists when service changes
  useEffect(() => {
    if (!selectedService) return
    setPlaylists([])
    setSelectedPlaylist('')
    setPlLoading(true)
    void (async () => {
      const result = await api.getStreamingPlaylists(selectedService)
      setPlLoading(false)
      if (api.isError(result)) {
        notifyApi.error({ message: 'Failed to load playlists', description: result.error.message, placement: 'topRight' })
        return
      }
      setPlaylists(result.data)
    })()
  }, [selectedService]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleLink = async () => {
    const playlist = playlists.find(p => p.id === selectedPlaylist)
    if (!playlist || !selectedService) return
    setLinking(true)
    try {
      const result = await api.linkPlaylistToShareList(sharelistId, {
        provider: selectedService,
        playlistId: playlist.id,
        playlistName: playlist.name,
        imageUrl: playlist.imageUrl ?? null,
        externalUrl: playlist.externalUrl ?? null,
      })
      if (api.isError(result)) {
        notifyApi.error({ message: 'Failed to link playlist', description: result.error.message, placement: 'topRight' })
        return
      }
      onLinked()
    } finally {
      setLinking(false)
    }
  }

  const handleClose = () => {
    setService('')
    setPlaylists([])
    setSelectedPlaylist('')
    onClose()
  }

  const connectedOptions = connected
    .map(svc => {
      const meta = PROVIDER_META[svc.provider]
      if (!meta) return null
      return { value: svc.provider, label: meta.label, icon: meta.icon, color: meta.color }
    })
    .filter(Boolean) as { value: string; label: string; icon: typeof faSpotify; color: string }[]

  const selectedMeta = selectedService ? PROVIDER_META[selectedService] : null

  return (
    <>
      {contextHolder}
      <Modal
        open
        onCancel={handleClose}
        footer={null}
        width={560}
        centered
        style={{ padding: 0 }}
        styles={{
          container: {
            background: 'rgba(17, 19, 20, 0.98)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
            borderRadius: '16px',
            padding: 0,
            overflow: 'hidden',
          },
          body: { padding: 0, margin: 0 },
          mask: { backdropFilter: 'blur(3px)', background: 'rgba(0, 0, 0, 0.4)' },
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px 28px',
          background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(74, 222, 128, 0.1) 100%)',
          borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
        }}>
          <Flex align="center" gap={12}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #38BDF8 0%, #4ADE80 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)',
            }}>
              <LinkOutlined />
            </div>
            <div>
              <Title level={4} style={{ margin: 0, color: '#F1F5F9', fontSize: '18px', fontWeight: 700 }}>
                Link Playlist
              </Title>
              <Text style={{ color: '#94A3B8', fontSize: '13px' }}>
                Connect a playlist from your music service
              </Text>
            </div>
          </Flex>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 28px' }}>

          {/* Loading services */}
          {servicesLoading && (
            <Flex justify="center" style={{ padding: '24px 0' }}>
              <Spin indicator={<LoadingOutlined style={{ fontSize: 28, color: '#38BDF8' }} spin />} />
            </Flex>
          )}

          {/* No services */}
          {!servicesLoading && connectedOptions.length === 0 && (
            <Text style={{ color: '#64748B', fontSize: '14px', display: 'block', textAlign: 'center', padding: '24px 0' }}>
              No music services connected. Go to Settings to connect one.
            </Text>
          )}

          {/* Main flow */}
          {!servicesLoading && connectedOptions.length > 0 && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <Text style={{ color: '#F1F5F9', display: 'block', marginBottom: '12px', fontSize: '13px', fontWeight: 600 }}>
                  Select Music Service
                </Text>
                <Select
                  value={selectedService || undefined}
                  onChange={v => setService(v as string)}
                  placeholder="Choose your music service"
                  style={{ width: '100%' }}
                  size="large"
                  options={connectedOptions.map(opt => ({
                    value: opt.value,
                    label: (
                      <Flex align="center" gap={10}>
                        <FontAwesomeIcon icon={opt.icon} style={{ fontSize: '18px', color: opt.color }} />
                        <Text style={{ color: '#F1F5F9', fontSize: '14px', fontWeight: 500 }}>{opt.label}</Text>
                      </Flex>
                    ),
                  }))}
                />
              </div>

              <Divider style={{ margin: '20px 0', borderColor: 'rgba(56, 189, 248, 0.1)' }} />

              {selectedService && playlistsLoading && (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <Spin size="large" indicator={<LoadingOutlined style={{ fontSize: 36, color: '#38BDF8' }} />} />
                  <Text style={{ display: 'block', marginTop: '16px', color: '#94A3B8', fontSize: '14px' }}>
                    Loading your {selectedMeta?.label} playlists…
                  </Text>
                </div>
              )}

              {selectedService && !playlistsLoading && playlists.length > 0 && (
                <>
                  <Flex align="center" gap={8} style={{ marginBottom: '14px' }}>
                    <CheckCircleOutlined style={{ fontSize: '16px', color: '#4ADE80' }} />
                    <Text style={{ color: '#4ADE80', fontSize: '13px', fontWeight: 600 }}>
                      Connected to {selectedMeta?.label}
                    </Text>
                  </Flex>

                  <Text style={{ color: '#F1F5F9', display: 'block', marginBottom: '12px', fontSize: '13px', fontWeight: 600 }}>
                    Select a Playlist
                  </Text>

                  <div style={{ maxHeight: '280px', overflowY: 'auto', background: 'rgba(17, 19, 20, 0.5)', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.15)', padding: '8px' }}>
                    <Space direction="vertical" size={8} style={{ width: '100%' }}>
                      {playlists.map(playlist => (
                        <div
                          key={playlist.id}
                          onClick={() => setSelectedPlaylist(playlist.id)}
                          style={{
                            padding: '14px 16px',
                            background: selectedPlaylist === playlist.id ? 'rgba(56, 189, 248, 0.15)' : 'rgba(28, 31, 33, 0.6)',
                            border: selectedPlaylist === playlist.id ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(56, 189, 248, 0.1)',
                            borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={e => { if (selectedPlaylist !== playlist.id) e.currentTarget.style.background = 'rgba(56, 189, 248, 0.08)' }}
                          onMouseLeave={e => { if (selectedPlaylist !== playlist.id) e.currentTarget.style.background = 'rgba(28, 31, 33, 0.6)' }}
                        >
                          <Flex justify="space-between" align="center">
                            <Flex align="center" gap={12} style={{ flex: 1, minWidth: 0 }}>
                              {playlist.imageUrl && (
                                <img src={playlist.imageUrl} alt="" style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
                              )}
                              <div style={{ minWidth: 0 }}>
                                <Text style={{ color: '#F1F5F9', fontSize: '14px', fontWeight: 600, display: 'block', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {playlist.name}
                                </Text>
                                <Text style={{ color: '#64748B', fontSize: '12px' }}>
                                  {playlist.trackCount} {playlist.trackCount === 1 ? 'track' : 'tracks'}
                                </Text>
                              </div>
                            </Flex>
                            {selectedPlaylist === playlist.id && (
                              <CheckCircleOutlined style={{ fontSize: '20px', color: '#38BDF8', marginLeft: '12px', flexShrink: 0 }} />
                            )}
                          </Flex>
                        </div>
                      ))}
                    </Space>
                  </div>
                </>
              )}

              {selectedService && !playlistsLoading && playlists.length === 0 && (
                <Empty
                  description={<Text style={{ color: '#64748B', fontSize: '13px' }}>No playlists found in your {selectedMeta?.label} account</Text>}
                  style={{ padding: '32px 20px', background: 'rgba(17, 19, 20, 0.5)', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.1)' }}
                />
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 28px', borderTop: '1px solid rgba(56, 189, 248, 0.1)', background: 'rgba(17, 19, 20, 0.5)' }}>
          <Flex gap={12} justify="flex-end">
            <Button
              size="large"
              onClick={handleClose}
              style={{ background: 'transparent', border: '1px solid rgba(148, 163, 184, 0.3)', color: '#94A3B8', borderRadius: '10px', height: '44px', padding: '0 20px', fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button
              size="large"
              loading={linking}
              disabled={!selectedPlaylist}
              icon={!linking && <LinkOutlined />}
              onClick={() => void handleLink()}
              style={{
                background: selectedPlaylist ? 'linear-gradient(135deg, #38BDF8 0%, #4ADE80 100%)' : 'rgba(56, 189, 248, 0.1)',
                border: 'none', borderRadius: '10px', height: '44px', padding: '0 24px',
                fontSize: '14px', fontWeight: 700,
                color: selectedPlaylist ? '#FFFFFF' : '#64748B',
                boxShadow: selectedPlaylist ? '0 4px 16px rgba(56, 189, 248, 0.25)' : 'none',
                opacity: selectedPlaylist ? 1 : 0.6,
              }}
            >
              {linking ? 'Linking…' : 'Link Playlist'}
            </Button>
          </Flex>
        </div>
      </Modal>
    </>
  )
}

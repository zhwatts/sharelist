import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout, Card, Flex, Skeleton, Typography, notification } from 'antd'
import { PlaylistHero } from '../components/PlaylistHero'
import { SyncStatusBar } from '../components/SyncStatusBar'
import { TrackList } from '../components/TrackList'
import { LaunchStreamingFAB } from '../components/LaunchStreamingFAB'
import { LinkPlaylistModal } from '../components/LinkPlaylistModal'
import type { Track } from '../components/TrackList'
import * as api from '../lib/api'
import type { ShareListDetail } from '../lib/api'

const { Content } = Layout
const { Text } = Typography

/** Format milliseconds → "m:ss" */
function formatDuration(ms: number): string {
  const totalSecs = Math.floor(ms / 1000)
  const mins = Math.floor(totalSecs / 60)
  const secs = totalSecs % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function PlaylistView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [notifyApi, contextHolder] = notification.useNotification()

  const [sharelist, setSharelist]         = useState<ShareListDetail | null>(null)
  const [isLoading, setLoading]           = useState(true)
  const [syncing, setSyncing]             = useState(false)
  const [lastSynced, setLastSynced]       = useState<Date | null>(null)
  const [error, setError]                 = useState<string | null>(null)
  const [showLinkModal, setShowLinkModal] = useState(false)

  const loadShareList = async (isSync = false) => {
    if (!id) return
    if (isSync) setSyncing(true)
    else setLoading(true)
    const result = await api.getShareList(id)
    if (isSync) setSyncing(false)
    else setLoading(false)
    if (api.isError(result)) {
      setError(result.error.message)
      return
    }
    setSharelist(result.data)
    setLastSynced(new Date())
  }

  const handleSync = () => { void loadShareList(true) }

  useEffect(() => {
    void loadShareList()
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!id) {
    navigate('/')
    return null
  }

  const primaryLink = sharelist?.links.find(l => l.isPrimary) ?? sharelist?.links[0] ?? null

  const tracks: Track[] = (sharelist?.tracks ?? []).map(t => ({
    id: t.id,
    title: t.title,
    artist: t.artist,
    duration: formatDuration(t.durationMs),
    albumArt: t.imageUrl,
    platform: primaryLink?.provider as Track['platform'] | undefined,
  }))

  const heroLinks = (sharelist?.links ?? []).map(l => ({
    provider: l.provider,
    playlistName: l.playlistName,
    imageUrl: l.imageUrl,
  }))

  return (
    <Content style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 20px', width: '100%' }}>
      {contextHolder}

      {/* Error state */}
      {error && (
        <Card
          style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '16px', marginBottom: '16px' }}
          styles={{ body: { padding: '20px' } }}
        >
          <Text style={{ color: '#EF4444' }}>Failed to load ShareList: {error}</Text>
        </Card>
      )}

      <div style={{ marginBottom: '16px' }}>
        <PlaylistHero
          name={sharelist?.name ?? ''}
          trackCount={tracks.length}
          links={heroLinks}
          onLinkPlatform={() => setShowLinkModal(true)}
          isLoading={isLoading}
        />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <SyncStatusBar
          isLoading={isLoading}
          syncing={syncing}
          lastSynced={lastSynced}
          onManage={() => setShowLinkModal(true)}
          onSync={handleSync}
        />
      </div>

      {isLoading ? (
        <Card
          style={{ background: 'rgba(28, 31, 33, 0.4)', border: '1px solid rgba(56, 189, 248, 0.1)', borderRadius: '16px', backdropFilter: 'blur(20px)', overflow: 'hidden' }}
          styles={{ body: { padding: '16px' } }}
        >
          <Flex vertical gap={12}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Flex key={i} align="center" gap={12}>
                <Skeleton.Avatar active size={48} style={{ borderRadius: '8px', background: 'rgba(56, 189, 248, 0.1)' }} />
                <div style={{ flex: 1 }}>
                  <Skeleton.Input active size="small" style={{ width: '60%', marginBottom: '6px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '6px' }} />
                  <Skeleton.Input active size="small" style={{ width: '40%', background: 'rgba(56, 189, 248, 0.08)', borderRadius: '6px' }} />
                </div>
                <Skeleton.Input active size="small" style={{ width: '40px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '6px' }} />
              </Flex>
            ))}
          </Flex>
        </Card>
      ) : (
        !error && tracks.length === 0 ? (
          <Card
            style={{ background: 'rgba(28, 31, 33, 0.4)', border: '1px solid rgba(56, 189, 248, 0.1)', borderRadius: '16px', textAlign: 'center' }}
            styles={{ body: { padding: '48px 20px' } }}
          >
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎵</div>
            <Text style={{ color: '#64748B', fontSize: '14px' }}>No tracks found for this playlist.</Text>
          </Card>
        ) : (
          <TrackList tracks={tracks} />
        )
      )}

      <LaunchStreamingFAB externalUrl={primaryLink?.externalUrl} />

      {showLinkModal && sharelist && (
        <LinkPlaylistModal
          sharelistId={sharelist.id}
          onClose={() => setShowLinkModal(false)}
          onLinked={() => {
            setShowLinkModal(false)
            notifyApi.success({ message: 'Playlist linked!', placement: 'topRight' })
            void loadShareList()
          }}
        />
      )}
    </Content>
  )
}

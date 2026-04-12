import { useState, useEffect } from 'react'
import { Layout, Card, Flex, Skeleton } from 'antd'
import { PlaylistHero } from '../components/PlaylistHero'
import { SyncStatusBar } from '../components/SyncStatusBar'
import { TrackList } from '../components/TrackList'
import { LaunchStreamingFAB } from '../components/LaunchStreamingFAB'
import { LinkPlatformModal } from '../components/LinkPlatformModal'
import type { Track } from '../components/TrackList'

const { Content } = Layout

const albumImages = [
  'https://images.unsplash.com/photo-1644855640845-ab57a047320e?w=400&q=80',
  'https://images.unsplash.com/photo-1703115015343-81b498a8c080?w=400&q=80',
  'https://images.unsplash.com/photo-1618972677328-9cd129a74c14?w=400&q=80',
  'https://images.unsplash.com/photo-1660087031197-f483b4388e91?w=400&q=80',
]

const mockTracks: Track[] = [
  { id: 1, title: 'Blinding Lights', artist: 'The Weeknd', duration: '3:20', albumArt: albumImages[0], isPlaying: true, platform: 'spotify' },
  { id: 2, title: 'Electric Feel', artist: 'MGMT', duration: '3:49', albumArt: albumImages[1], isNew: true, platform: 'amazon' },
  { id: 3, title: 'Mr. Brightside', artist: 'The Killers', duration: '3:42', albumArt: albumImages[2], platform: 'spotify' },
  { id: 4, title: 'Good Days', artist: 'SZA', duration: '4:39', albumArt: albumImages[3], platform: 'amazon' },
  { id: 5, title: 'Levitating', artist: 'Dua Lipa', duration: '3:23', albumArt: albumImages[0], isNew: true, platform: 'spotify' },
  { id: 6, title: 'Take Five', artist: 'Dave Brubeck', duration: '5:24', albumArt: albumImages[1], platform: 'amazon' },
  { id: 7, title: 'Midnight City', artist: 'M83', duration: '4:04', albumArt: albumImages[2], platform: 'spotify' },
  { id: 8, title: 'Wonderwall', artist: 'Oasis', duration: '4:18', albumArt: albumImages[3], platform: 'amazon' },
]

export function PlaylistView() {
  const [isLoading, setIsLoading] = useState(true)
  const [showLinkModal, setShowLinkModal] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <Content style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 20px', width: '100%' }}>
      <div style={{ marginBottom: '16px' }}>
        <PlaylistHero albumImages={albumImages} isLoading={isLoading} />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <SyncStatusBar isLoading={isLoading} onManage={() => setShowLinkModal(true)} />
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
        <TrackList tracks={mockTracks} />
      )}

      <LaunchStreamingFAB onClick={() => setShowLinkModal(true)} />

      {showLinkModal && (
        <LinkPlatformModal
          onClose={() => setShowLinkModal(false)}
          onConnected={() => setShowLinkModal(false)}
        />
      )}
    </Content>
  )
}

import type { Platform } from '@sharelist/shared'

const SUPPORTED_PLATFORMS: Platform[] = ['spotify', 'apple_music', 'youtube_music']

function App() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-900">ShareList</h1>
      <p className="text-gray-500">{SUPPORTED_PLATFORMS.join(' · ')}</p>
    </main>
  )
}

export default App

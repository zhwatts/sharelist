import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        sl: {
          bg:      '#111314',
          surface: '#1C1F21',
          nav:     '#161819',
          border:  '#2A2D30',
          accent:  '#38BDF8',
          mint:    '#4ADE80',
          text:    '#F1F5F9',
          muted:   '#64748B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config

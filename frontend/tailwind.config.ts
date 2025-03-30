import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        'strobe-left': {
          '0%, 100%': { opacity: '0.1' },
          '50%': { opacity: '1' }
        },
        'strobe-right': {
          '0%, 100%': { opacity: '0.1' },
          '50%': { opacity: '1' }
        }
      },
      animation: {
        'strobe-left': 'strobe-left 1.5s ease-in-out infinite',
        'strobe-right': 'strobe-right 1.5s ease-in-out infinite reverse'
      }
    },
  },
  plugins: [],
}

export default config 
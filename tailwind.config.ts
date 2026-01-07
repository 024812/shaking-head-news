import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './app/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      // Font family with Noto Sans SC for Chinese character support
      fontFamily: {
        sans: [
          'var(--font-inter)',
          'var(--font-noto-sans-sc)',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
      },
      // Colors and other theme values are defined in globals.css @theme block
      // This follows Tailwind CSS 4.x best practices
    },
  },
  // Note: In Tailwind CSS 4.x, plugins like tailwindcss-animate should be
  // configured via CSS @plugin directive or kept here for backward compatibility
  plugins: [require('tailwindcss-animate')],
}

export default config

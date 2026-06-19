import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Base surfaces
        ivory: '#FAF6EF',
        cream: '#FFFDFA',
        // Near-black warm ink (text)
        ink: {
          DEFAULT: '#221619',
          soft: '#4A3B3E',
          muted: '#6E5C5F',
        },
        // Primary — deep maroon / oxblood
        oxblood: {
          50: '#FBECEF',
          100: '#F6D6DC',
          200: '#E9A9B6',
          300: '#DA7C90',
          400: '#C04E6A',
          500: '#9E2E4C',
          600: '#7E1F38',
          700: '#6A1A30',
          800: '#511325',
          900: '#3A0D1B',
          DEFAULT: '#7E1F38',
        },
        // Secondary — dried rose
        rose: {
          100: '#F4E3E4',
          200: '#E7C4C6',
          300: '#D6A2A8',
          400: '#C68A92',
          500: '#B26E78',
          600: '#9A5560',
          DEFAULT: '#B26E78',
        },
        // Accent — champagne gold
        gold: {
          100: '#F6ECD5',
          200: '#EBD9AC',
          300: '#DCC07B',
          400: '#CBA655',
          500: '#B8924A',
          600: '#9A7838',
          DEFAULT: '#B8924A',
        },
        line: '#E7DCCB', // warm hairline border
      },
      fontFamily: {
        playfair: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 3px rgba(34,22,25,0.06)',
        card: '0 1px 2px rgba(58,13,27,0.04), 0 10px 30px -14px rgba(58,13,27,0.14)',
        'card-hover': '0 6px 12px rgba(58,13,27,0.07), 0 22px 48px -18px rgba(58,13,27,0.24)',
        gold: '0 8px 24px -10px rgba(184,146,74,0.45)',
      },
      letterSpacing: {
        widest: '0.22em',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in': 'fade-in 0.4s ease-out both',
      },
    },
  },
  plugins: [],
}
export default config

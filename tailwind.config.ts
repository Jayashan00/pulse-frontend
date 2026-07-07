import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Professional purple & orange palette
        primary: {
          DEFAULT: '#7C3AED', // violet 600
          soft: '#A78BFA',
          deep: '#4C1D95',
        },
        accent: {
          DEFAULT: '#F97316', // orange 500
          soft: '#FDBA74',
          deep: '#C2410C',
        },
        surface: {
          light: '#FAF8FF',
          card: '#FFFFFF',
          dark: '#0D0916',
          'dark-card': '#171022',
          'dark-raised': '#221936',
        },
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
      },
      backgroundImage: {
        pulse: 'linear-gradient(135deg, #7C3AED 0%, #C026D3 50%, #F97316 100%)',
      },
      boxShadow: {
        glow: '0 0 40px rgba(124, 58, 237, 0.35)',
        'glow-orange': '0 0 30px rgba(249, 115, 22, 0.30)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotateX(12deg) rotateY(-8deg)' },
          '50%': { transform: 'translateY(-18px) rotateX(6deg) rotateY(8deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
        shimmer: 'shimmer 1.4s linear infinite',
        'pulse-ring': 'pulse-ring 1.6s ease-out infinite',
      },
    },
  },
  plugins: [],
};
export default config;

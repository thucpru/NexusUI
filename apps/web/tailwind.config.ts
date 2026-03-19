import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Figma warm gray backgrounds
        bg: {
          primary: '#1E1E1E',
          secondary: '#2C2C2C',
          tertiary: '#383838',
          quaternary: '#444444',
        },
        border: {
          default: '#383838',
          subtle: '#333333',
          strong: '#4D4D4D',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#B3B3B3',
          tertiary: '#808080',
          quaternary: '#666666',
        },
        accent: {
          primary: '#0C8CE9',
          'primary-hover': '#0D99FF',
          brand: '#A259FF',
          success: '#14AE5C',
          warning: '#F2994A',
          error: '#F24822',
          info: '#0C8CE9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.3)',
        md: '0 4px 12px rgba(0,0,0,0.4)',
        lg: '0 8px 24px rgba(0,0,0,0.5)',
        xl: '0 16px 48px rgba(0,0,0,0.6)',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '200ms',
        slow: '300ms',
      },
      spacing: {
        '18': '72px',
      },
      width: {
        sidebar: '240px',
      },
      height: {
        topbar: '56px',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite linear',
        'fade-in': 'fade-in 200ms ease',
        'slide-in-right': 'slide-in-right 300ms ease',
      },
    },
  },
  plugins: [],
};

export default config;

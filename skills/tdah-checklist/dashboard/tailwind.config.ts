import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--bg-primary)',
        secondary: 'var(--bg-secondary)',
        card: 'var(--bg-card)',
        'card-hover': 'var(--bg-card-hover)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-accent': 'var(--text-accent)',
        accent: {
          primary: 'var(--accent-primary)',
          secondary: 'var(--accent-secondary)',
        },
        border: 'var(--border-color)',
        column: {
          red: 'var(--col-red)',
          yellow: 'var(--col-yellow)',
          green: 'var(--col-green)',
          gray: 'var(--col-gray)',
          blue: 'var(--col-blue)',
        },
        semantic: {
          success: 'var(--success)',
          warning: 'var(--warning)',
          error: 'var(--error)',
          info: 'var(--info)',
        },
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'var(--font-display)', 'sans-serif'],
        sans: ['var(--font-body)', 'Inter', '-apple-system', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        card: 'var(--radius-card)',
        pill: 'var(--radius-pill)',
        btn: '6px',
      },
      boxShadow: {
        card: '0 4px 12px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3)',
        'card-hover':
          '0 8px 24px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 255, 242, 0.08)',
        'accent-glow':
          '0 0 20px rgba(0, 255, 242, 0.2), 0 0 40px rgba(139, 92, 246, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 240ms cubic-bezier(0.22, 1, 0.36, 1)',
        shimmer: 'shimmer 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;

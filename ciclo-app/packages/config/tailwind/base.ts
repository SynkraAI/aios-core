import type { Config } from 'tailwindcss'

const config: Partial<Config> = {
  theme: {
    screens: {
      sm: '375px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // === BASE TRIADE (Paleta Herdada) ===
        'base-forest': '#24451F',
        'base-dark': '#213B2C',
        'base-green': '#3F6E36',
        'base-emerald': '#5EA142',
        'base-teal': '#5184A7',
        'base-ocean': '#185474',
        'base-sky': '#8DC2DB',
        'base-amber': '#D48113',
        'base-gold': '#D2B317',
        'base-copper': '#C97A46',
        'base-earth': '#5F4822',
        'base-cream': '#F5EED4',
        'base-coral': '#CD684D',
        'base-violet': '#932E88',

        // === ESPECTRO VIOLETA (Alta Frequência) ===
        violet: {
          50: '#FDF4FF',
          100: '#FAE8FF',
          200: '#F0BBFE',
          300: '#E089FC',
          400: '#C945E8',
          500: '#A830C0',
          600: '#932E88',
          700: '#7B1FA2',
          800: '#5C1680',
          900: '#3B0764',
          950: '#1E0338',
        },

        // === TOKENS SAZONAIS (CSS Custom Properties) ===
        seasonal: {
          primary: 'var(--season-primary)',
          secondary: 'var(--season-secondary)',
          accent: 'var(--season-accent)',
          glow: 'var(--season-glow)',
          bg: 'var(--season-bg)',
        },

        // === SHADCN/UI TOKENS ===
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
      },

      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        heading: ['var(--font-heading)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        accent: ['var(--font-accent)', 'cursive'],
        mono: ['var(--font-mono)', 'monospace'],
      },

      fontSize: {
        xs: 'clamp(0.694rem, 0.65vi + 0.55rem, 0.75rem)',
        sm: 'clamp(0.833rem, 0.8vi + 0.65rem, 0.875rem)',
        base: 'clamp(1rem, 1vi + 0.75rem, 1.125rem)',
        lg: 'clamp(1.2rem, 1.3vi + 0.85rem, 1.5rem)',
        xl: 'clamp(1.44rem, 1.7vi + 1rem, 1.875rem)',
        '2xl': 'clamp(1.728rem, 2.2vi + 1.1rem, 2.25rem)',
        '3xl': 'clamp(2.074rem, 2.8vi + 1.3rem, 3rem)',
        '4xl': 'clamp(2.488rem, 3.5vi + 1.5rem, 3.75rem)',
        '5xl': 'clamp(2.986rem, 4.5vi + 1.7rem, 4.5rem)',
        hero: 'clamp(3.583rem, 6vi + 2rem, 6rem)',
      },

      spacing: {
        phi: '1.618rem',
        'phi-2': '2.618rem',
        'phi-3': '4.236rem',
        'phi-4': '6.854rem',
        'phi-5': '11.09rem',
      },

      borderRadius: {
        sm: '0.375rem',
        md: '0.75rem',
        lg: '1.5rem',
        xl: '2.5rem',
        full: '9999px',
        organic: '30% 70% 70% 30% / 30% 30% 70% 70%',
        petal: '50% 0% 50% 0%',
      },

      backgroundImage: {
        'gradient-triskle': 'conic-gradient(from 0deg, #24451F 0deg, #D48113 120deg, #8B4513 240deg, #24451F 360deg)',
        'gradient-mandala': 'radial-gradient(ellipse at center, #d4a574 0%, #8B4513 30%, #2d1810 70%, #1a0e08 100%)',
        'gradient-sacred': 'linear-gradient(135deg, var(--season-primary) 0%, var(--season-secondary) 50%, var(--season-glow) 100%)',
        'gradient-earth': 'linear-gradient(135deg, #fef9f0 0%, #d4a574 50%, #8B4513 100%)',
      },

      boxShadow: {
        'glow-golden': '0 0 10px rgba(212,165,116,0.3), 0 0 30px rgba(212,165,116,0.15), 0 0 60px rgba(212,165,116,0.05)',
        'glow-golden-sm': '0 0 8px rgba(212,165,116,0.25), 0 0 20px rgba(212,165,116,0.1)',
        'glow-season': '0 0 10px var(--season-glow-alpha-30), 0 0 30px var(--season-glow-alpha-15)',
        sacred: '0 0 30px rgba(212,165,116,0.1), inset 0 0 30px rgba(212,165,116,0.05)',
      },

      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
        },
        'mandala-slow': {
          to: { transform: 'rotate(360deg)' },
        },
        'ethereal-in': {
          from: {
            opacity: '0',
            transform: 'translateY(20px) scale(0.98)',
            filter: 'blur(4px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0) scale(1)',
            filter: 'blur(0)',
          },
        },
        'sacred-shimmer': {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'season-fade': {
          '0%': { opacity: '0.7' },
          '100%': { opacity: '1' },
        },
        'season-slide': {
          '0%': { transform: 'translateY(4px)', opacity: '0.8' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },

      animation: {
        breathe: 'breathe 4s ease-in-out infinite',
        'mandala-slow': 'mandala-slow 30s linear infinite',
        'ethereal-in': 'ethereal-in 0.6s ease-out forwards',
        'sacred-shimmer': 'sacred-shimmer 3s ease-in-out infinite',
        'season-fade': 'season-fade 0.5s ease-out',
        'season-slide': 'season-slide 0.4s ease-out',
        float: 'float 6s ease-in-out infinite',
      },

      transitionProperty: {
        seasonal: 'background-color, border-color, color, fill, stroke, box-shadow',
      },
      transitionDuration: {
        seasonal: '500ms',
      },
    },
  },
}

export default config

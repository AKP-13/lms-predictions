import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

export default {
  // A dark: class ignores .light-only. Use the tokens in globals.css instead.
  darkMode: 'media',
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}'
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-nunito)', ...fontFamily.sans]
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        sheet: 'var(--shadow-sheet)'
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
          bg: 'hsl(var(--destructive-bg))'
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          bg: 'hsl(var(--success-bg))'
        },
        tint: 'hsl(var(--tint))',
        scrim: 'var(--scrim)',
        chip: 'hsl(var(--chip))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
          bg: 'hsl(var(--accent-bg))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        difficulty: {
          easiest: {
            DEFAULT: 'hsl(var(--difficulty-easiest))',
            foreground: 'hsl(var(--difficulty-easiest-foreground))'
          },
          easy: {
            DEFAULT: 'hsl(var(--difficulty-easy))',
            foreground: 'hsl(var(--difficulty-easy-foreground))'
          },
          neutral: {
            DEFAULT: 'hsl(var(--chip))',
            foreground: 'hsl(var(--muted-foreground))'
          },
          hard: {
            DEFAULT: 'hsl(var(--difficulty-hard))',
            foreground: 'hsl(var(--difficulty-hard-foreground))'
          },
          hardest: {
            DEFAULT: 'hsl(var(--difficulty-hardest))',
            foreground: 'hsl(var(--difficulty-hardest-foreground))'
          }
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
} satisfies Config;

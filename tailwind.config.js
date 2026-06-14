/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        milky: {
          50: 'hsl(var(--milky-h), var(--milky-s), 97%)',
          100: 'hsl(var(--milky-h), var(--milky-s), 94%)',
          150: 'hsl(var(--milky-h), var(--milky-s), 91%)',
          200: 'hsl(var(--milky-h), var(--milky-s), 87%)',
          300: 'hsl(var(--milky-h), var(--milky-s), 80%)',
          400: 'hsl(var(--milky-h), var(--milky-s), 70%)',
          500: 'hsl(var(--milky-h), var(--milky-s), 58%)',
          600: 'hsl(var(--milky-h), var(--milky-s), 45%)',
          700: 'hsl(var(--milky-h), var(--milky-s), 35%)',
          800: 'hsl(var(--milky-h), var(--milky-s), 22%)',
          900: 'hsl(var(--milky-h), var(--milky-s), 12%)',
        },
        accent: {
          50: 'hsl(var(--accent-h), var(--accent-s), 96%)',
          100: 'hsl(var(--accent-h), var(--accent-s), 92%)',
          200: 'hsl(var(--accent-h), var(--accent-s), 84%)',
          300: 'hsl(var(--accent-h), var(--accent-s), 72%)',
          400: 'hsl(var(--accent-h), var(--accent-s), 60%)',
          500: 'hsl(var(--accent-h), var(--accent-s), 50%)',
          600: 'hsl(var(--accent-h), var(--accent-s), 42%)',
          700: 'hsl(var(--accent-h), var(--accent-s), 34%)',
          800: 'hsl(var(--accent-h), var(--accent-s), 24%)',
          900: 'hsl(var(--accent-h), var(--accent-s), 14%)',
        },
      },
      maxWidth: {
        app: '480px',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 8px 2px hsla(25, 80%, 55%, 0.3)' },
          '50%': { boxShadow: '0 0 20px 6px hsla(25, 80%, 55%, 0.5)' },
        },
        'float-up': {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'typing-dot': {
          '0%, 100%': { opacity: 0.3, transform: 'scale(0.8)' },
          '50%': { opacity: 1, transform: 'scale(1.1)' },
        },
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float-up': 'float-up 0.3s ease-out',
        'typing-dot': 'typing-dot 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

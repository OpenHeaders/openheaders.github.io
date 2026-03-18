/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg:      { DEFAULT: 'var(--c-bg)', 2: 'var(--c-bg2)', 3: 'var(--c-bg3)', 4: 'var(--c-bg4)' },
        bd:      { DEFAULT: 'var(--c-bd)', hi: 'var(--c-bdhi)' },
        tx:      { DEFAULT: 'var(--c-tx)', 2: 'var(--c-tx2)', 3: 'var(--c-tx3)' },
        accent:  { DEFAULT: 'var(--c-accent)', hi: 'var(--c-accenthi)' },
        success: 'var(--c-success)',
      },
      fontFamily: {
        display: ['Inter', '-apple-system', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
        body:    ['Inter', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '18px',
      },
      animation: {
        'fade-up':   'fadeUp .65s ease both',
        'spin-slow': 'spin 1.2s linear infinite',
        'blink':     'blink 2.2s ease infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'none' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '.3' },
        },
      },
    },
  },
  plugins: [],
};

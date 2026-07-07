/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        grc: {
          bg: '#0f1623',
          sidebar: '#151d2e',
          card: '#1a2332',
          border: '#2a3548',
          text: '#e2e8f0',
          muted: '#94a3b8',
          accent: '#6366f1',
          accentHover: '#818cf8',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
        },
      },
    },
  },
  plugins: [],
}

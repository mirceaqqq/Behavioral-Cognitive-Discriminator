/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: '#1e293b',
        background: '#0f172a',
        border: '#334155',
        accent: '#3b82f6',
        accent2: '#8b5cf6',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      boxShadow: {
        glow: '0 0 25px rgba(59,130,246,0.35)',
      },
    },
  },
  plugins: [],
}

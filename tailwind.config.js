/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        body: ['Exo 2', 'sans-serif'],
      },
      colors: {
        space: {
          dark: '#070b14',
          mid: '#0f172a',
          light: '#1e293b',
        },
        neon: {
          blue: '#38bdf8',
          purple: '#a78bfa',
          green: '#4ade80',
          orange: '#fb923c',
          red: '#f87171',
        },
      },
    },
  },
  plugins: [],
};

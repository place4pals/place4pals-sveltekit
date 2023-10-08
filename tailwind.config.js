/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ['Arial'],
      header: ['Arial'],
    },
    colors: {
      // Theme vars
      background: 'var(--background)',
      text: 'var(--text)',
      card: 'var(--card)',
      // Color constants
      white: '#fff',
      black: '#000',
    }
  },
  plugins: [],
  darkMode: 'class',
}
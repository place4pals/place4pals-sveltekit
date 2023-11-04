/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Arial'],
        header: ['Arial'],
      },
      colors: {
        background: 'var(--background)',
        text: 'var(--text)',
        card: 'var(--card)',
        card2: 'var(--card2)',
        hover: 'var(--hover)',
        subtitle: 'var(--subtitle)',
        blue: 'var(--blue)',
        red: 'var(--red)',
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}


/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: '#1B4332',
        earth: '#D9C4A3',
        cream: '#F7F5F0',
        sage: '#95B8A4',
        amber: '#E0A458',
        rust: '#C1502E',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Fraunces', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'lg': '10px',
      }
    },
  },
  plugins: [],
}

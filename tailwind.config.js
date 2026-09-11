/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#14b8a6', // Teal 500
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59', // Dark teal matching the screenshot Sidebar
          900: '#134e4a',
        },
        sidebar: '#f8fafc',
        body: '#f1f5f9',
        accent: {
          50: '#fef3c7',
          500: '#f59e0b', // Yellow/Orange for the AI banner
        }
      }
    },
  },
  plugins: [],
}

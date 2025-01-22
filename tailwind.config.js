/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-purple': '#8B5CF6',
        'primary-gold': '#F6B05C',
        'secondary-purple': '#6D28D9',
        'secondary-gold': '#D4A017',
      },
      gradientColorStops: {
        'gradient-purple': '#8B5CF6',
        'gradient-gold': '#F6B05C',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(to right, #8B5CF6, #F6B05C)',
      }
    },
  },
  plugins: [],
}

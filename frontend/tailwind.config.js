/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Baloo 2', 'cursive'],
        body:    ['Nunito', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#EEF0FF',
          100: '#DDDEFF',
          500: '#6C63FF',
          600: '#5A52E8',
          700: '#4840CF',
        },
      },
      borderRadius: {
        xl:  '16px',
        '2xl': '20px',
      },
    },
  },
  plugins: [],
};

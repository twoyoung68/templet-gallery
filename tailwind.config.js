/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        daewoo: {
          DEFAULT: '#004B91',
          dark: '#003A70',
          light: '#0A5BA8',
        },
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        axis: {
          bg: '#F6DCCE',
          sub: '#FBECDE',
          detailBg: '#B0D5DF',
          detailSub: '#D3EBF2',
          accentRed: '#862617',
          accentBlue: '#191D6B',
        }
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'serif'],
        calligraphy: ['"Ma Shan Zheng"', 'cursive'],
      }
    }
  },
  plugins: [],
}
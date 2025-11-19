/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        primary: '#B2FF00',
        secondary: '#000000',
        accent: '#FFFFFF',
        neutral: '#F3F3F3',
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        grotesk: ['Inter', 'system-ui', 'sans-serif'], // Using Inter as Grotesk alternative
      },
      fontSize: {
        '9xl': '8rem',
        '10xl': '10rem',
      },
    },
  },
}

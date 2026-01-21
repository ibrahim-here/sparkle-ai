/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#B2FF00', // Neon Green
        secondary: '#050505', // Space Black
        accent: '#00F0FF', // Electric Cyan
        surface: '#121212', // Dark Surface
        muted: '#1A1A1A', // Muted Gray
        "border-glow": "rgba(178, 255, 0, 0.3)",
      },
      fontFamily: {
        outfit: ['"Outfit"', 'sans-serif'],
        sans: ['"Outfit"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '9xl': '8rem',
        '10xl': '10rem',
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(178, 255, 0, 0.4)',
        'glow-accent': '0 0 20px rgba(0, 240, 255, 0.4)',
        'glass': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.05)',
      },
      backgroundImage: {
        'grid-pattern': "radial-gradient(circle, rgba(178, 255, 0, 0.05) 1px, transparent 1px)",
      }
    },
  },
}

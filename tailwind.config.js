/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gamma: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        surface: {
          base: '#0B0F0E',
          raised: '#111B18',
          overlay: '#162420',
          border: '#1E3A34',
        },
        accent: {
          pink: '#EC4899',
          cyan: '#06B6D4',
          amber: '#F59E0B',
        },
        text: {
          primary: '#F0FDF4',
          secondary: '#94A3A8',
          muted: '#5E6E6A',
        },
        status: {
          success: '#22C55E',
          warning: '#F59E0B',
          error: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          900: '#0B0E14',
          800: '#121824',
          700: '#1B2234',
          600: '#263147',
        },
        offwhite: '#F8FAFC',
        accent: {
          orange: '#FF5E3A',
          emerald: '#00E599',
          violet: '#7000FF',
        },
      },
      boxShadow: {
        'glow-orange': '0 0 25px -5px rgba(255, 94, 58, 0.4)',
        'glow-emerald': '0 0 25px -5px rgba(0, 229, 153, 0.4)',
        'glow-violet': '0 0 25px -5px rgba(112, 0, 255, 0.4)',
        'soft-diffuse': '0 10px 30px -10px rgba(0, 0, 0, 0.08)',
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '32px',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        float: 'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

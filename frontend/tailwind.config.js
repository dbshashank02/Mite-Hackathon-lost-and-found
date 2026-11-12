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
        obsidian: {
          950: '#000000',
          900: '#0A0A0C',
          850: '#111114',
          800: '#18181C',
          700: '#222228',
          600: '#2E2E36',
        },
        studio: {
          50: '#FFFFFF',
          100: '#F5F5F7',
          200: '#E5E5EA',
          300: '#D1D1D6',
          400: '#AEAEB2',
          500: '#8E8E93',
        },
        apple: {
          blue: '#0071E3',
          blueHover: '#0077ED',
          darkBlue: '#0047AB',
        },
        tesla: {
          crimson: '#E82127',
          amber: '#FF4D2D',
          darkRed: '#B81419',
        },
        telemetry: {
          emerald: '#10B981',
          cyan: '#06B6D4',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Helvetica Neue"',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        mono: [
          '"SF Mono"',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Courier New"',
          'monospace',
        ],
      },
      letterSpacing: {
        tightest: '-0.035em',
        tighter: '-0.025em',
        tight: '-0.015em',
      },
      boxShadow: {
        'apple-glass': '0 8px 32px 0 rgba(0, 0, 0, 0.36)',
        'apple-light': '0 8px 30px rgba(0, 0, 0, 0.06)',
        'tesla-glow': '0 0 30px -5px rgba(232, 33, 39, 0.35)',
        'apple-blue-glow': '0 0 30px -5px rgba(0, 113, 227, 0.4)',
        'emerald-glow': '0 0 25px -5px rgba(16, 185, 129, 0.4)',
      },
      borderRadius: {
        'apple-sm': '12px',
        'apple-md': '18px',
        'apple-lg': '24px',
        'apple-xl': '28px',
        'apple-2xl': '36px',
        'apple-pill': '9999px',
      },
    },
  },
  plugins: [],
}

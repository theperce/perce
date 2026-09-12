/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // CS 1.6 Retro Palette
        cs: {
          bg: '#191e19',           // Dark Theme Background (темно-зеленый болотный)
          card: '#252d25',         // Card / Panel Background
          accent: '#c2c62c',       // Accent Text / Primary Buttons (классический желто-зеленый CS 1.6)
          secondary: '#5c7c5c',    // Secondary Accent
          border: '#3a473a',       // Borders (1px solid)
          light: '#3d4a3d',        // Lighter panel background
          hover: '#2f3a2f',        // Hover state
        },
        // Status Colors
        status: {
          green: '#48b848',        // Ready/Live
          red: '#d9534f',          // Banned/Offline
          yellow: '#e0a96d',       // In Queue/Picking
          blue: '#4a90d9',         // Info/CT
          orange: '#d98a4a',       // Warning/T
        },
      },
      fontFamily: {
        retro: ['"Courier New"', 'Courier', 'monospace'],
        cs: ['"Arial Black"', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        'none': '0',
        'sm': '2px',
        'md': '4px',
        'lg': '6px',
      },
      backgroundImage: {
        'cs-gradient': 'linear-gradient(180deg, #252d25 0%, #191e19 100%)',
        'cs-panel': 'linear-gradient(135deg, #252d25 0%, #1f261f 100%)',
      },
      boxShadow: {
        'cs-inner': 'inset 2px 2px 4px rgba(255,255,255,0.05), inset -2px -2px 4px rgba(0,0,0,0.3)',
        'cs-outer': '4px 4px 8px rgba(0,0,0,0.4)',
        'cs-accent': '0 0 10px rgba(194, 198, 44, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'blink': 'blink 1s step-end infinite',
        'queue-spin': 'spin 2s linear infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}

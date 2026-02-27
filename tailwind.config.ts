import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{vue,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gameBlue: '#0747A6',
        gameGold: '#F2C94C',
        gameInk: '#0B132B',
      },
      fontFamily: {
        display: ['"Russo One"', 'sans-serif'],
        body: ['"PT Sans"', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 12px 32px rgba(11, 19, 43, 0.18)',
      },
    },
  },
  plugins: [],
} satisfies Config

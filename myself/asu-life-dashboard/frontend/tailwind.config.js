export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        neon: {
          pink: '#f472b6',
          purple: '#a78bfa',
          blue: '#60a5fa',
        },
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
        blob: 'blob-animation 8s ease-in-out infinite',
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        'blob-animation': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(20px, -20px) scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
}

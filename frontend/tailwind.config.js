/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        usra: {
          red: '#E8364A',
          orange: '#F7941D',
          blue: '#4EAEE5',
          purple: '#9B59B6',
          pink: '#E91E8C',
          dark: '#1A1A2E',
          darker: '#0F0F1A',
          light: '#F0F8FF',
          card: '#FFFFFF',
        }
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Nunito', 'sans-serif'],
        malayalam: ['Noto Sans Malayalam', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-usra': 'linear-gradient(135deg, #4EAEE5 0%, #9B59B6 50%, #E91E8C 100%)',
        'gradient-hero': 'linear-gradient(160deg, #e0f4ff 0%, #f0e8ff 50%, #ffe8f4 100%)',
        'gradient-card': 'linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(240,248,255,0.8) 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.6s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      },
      boxShadow: {
        'usra': '0 20px 60px rgba(78, 174, 229, 0.3)',
        'card': '0 8px 32px rgba(0, 0, 0, 0.08)',
        'hover': '0 16px 48px rgba(78, 174, 229, 0.4)',
      }
    },
  },
  plugins: [],
}

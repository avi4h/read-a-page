/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Rubik', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
      colors: {
        'brand-teal': {
          '50': '#f0fdfa',
          '100': '#ccfbf1',
          '200': '#99f6e4',
          '300': '#5eead4',
          '400': '#2dd4bf',
          '500': '#14b8a6',
          '600': '#0d9488',
          '700': '#0f766e',
          '800': '#115e59',
          '900': '#134e4a',
          '950': '#042f2e',
        },
        'brand-purple': {
          '500': '#8b5cf6',
          '600': '#7c3aed'
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'fade-in-up': 'fadeInUp 0.4s ease-in-out',
        'popover-in': 'popoverIn 0.2s ease-out',
        'controls-in': 'controlsIn 0.3s cubic-bezier(0.21, 1.02, 0.73, 1)',
        'slide-in': 'slideIn 0.5s ease-out',
        'slide-out': 'slideOut 0.3s ease-in',
        'scale-in': 'scaleIn 0.3s ease-out',
        'scale-out': 'scaleOut 0.2s ease-in',
        'bounce-in': 'bounceIn 0.4s ease-out',
        'book-remove': 'bookRemove 0.4s ease-in-out forwards',
        'book-add': 'bookAdd 0.4s ease-out',
        'stagger-in': 'staggerIn 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        popoverIn: {
          '0%': { opacity: '0', transform: 'translateY(8px) scale(.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        controlsIn: {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideOut: {
          '0%': { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0', transform: 'translateX(20px)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        scaleOut: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.8)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bookRemove: {
          '0%': { opacity: '1', transform: 'scale(1) rotateY(0)' },
          '50%': { opacity: '0.5', transform: 'scale(0.9) rotateY(90deg)' },
          '100%': { opacity: '0', transform: 'scale(0.8) rotateY(180deg)', height: '0', margin: '0' },
        },
        bookAdd: {
          '0%': { opacity: '0', transform: 'scale(0.8) rotateY(180deg)' },
          '50%': { opacity: '0.5', transform: 'scale(0.9) rotateY(90deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotateY(0)' },
        },
        staggerIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      }
    }
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        farm: {
          barn: '#8B0000',
          'barn-dark': '#660000',
          wheat: '#F5DEB3',
          'wheat-light': '#FAF0DC',
          grass: '#7CFC00',
          'grass-dark': '#228B22',
          sky: '#87CEEB',
          'sky-light': '#B0E0E6',
          soil: '#8B4513',
          'soil-dark': '#654321',
          hay: '#DAA520',
          corn: '#FBEC5D',
          tomato: '#FF6347',
          pumpkin: '#FF7518',
          fence: '#D2691E',
          stone: '#708090',
        }
      },
      fontFamily: {
        'rustic': ['Georgia', 'serif'],
        'farm': ['system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'barn-door': 'barnDoor 0.8s ease-in-out',
        'windmill': 'windmill 10s linear infinite',
        'grow': 'grow 1s ease-out',
        'harvest': 'harvest 0.6s ease-in-out',
        'sway': 'sway 3s ease-in-out infinite',
      },
      keyframes: {
        barnDoor: {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
        windmill: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        grow: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        harvest: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(0)' },
        },
        sway: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        }
      },
      backgroundImage: {
        'farm-pattern': "url('/farm-assets/field-pattern.svg')",
        'wood-texture': "url('/farm-assets/wood-texture.svg')",
      }
    },
  },
  plugins: [],
}
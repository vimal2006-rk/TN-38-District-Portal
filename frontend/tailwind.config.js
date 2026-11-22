/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    screens: {
      'xs': '320px',        // Small Mobile (320px–359px)
      'phone': '375px',     // Standard Mobile (360px–479px)
      'phablet': '480px',   // Large Mobile (480px–575px)
      'sm': '576px',        // Small Tablet (576px–767px)
      'md': '768px',        // Tablet (768px–991px)
      'lg': '992px',        // Large Tablet (992px–1023px)
      'laptop': '1024px',   // Small Laptop (1024px–1279px)
      'xl': '1280px',       // Laptop (1280px–1439px)
      '2xl': '1440px',      // Desktop (1440px–1919px)
      '3xl': '1920px',      // Large Desktop (1920px–2559px)
      '4k': '2560px',       // 4K Displays (2560px+)
    },
    extend: {
      colors: {
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          900: '#7c2d12',
        },
        secondary: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
      },
      fontFamily: {
        tamil: ['"Noto Sans Tamil"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

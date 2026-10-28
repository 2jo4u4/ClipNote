/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './.storybook/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        raycast: {
          dark: {
            bg: '#18181b',
            surface: '#232326',
            hover: '#2c2c30',
            border: 'rgba(255, 255, 255, 0.08)',
            text: '#f4f4f5',
            muted: '#a1a1aa',
            subtle: '#71717a',
          },
          light: {
            bg: '#faf9f6',
            surface: '#ffffff',
            hover: '#f4f4f5',
            border: 'rgba(0, 0, 0, 0.06)',
            text: '#18181b',
            muted: '#71717a',
            subtle: '#a1a1aa',
          },
          coral: '#FF6363',
          amber: '#F59E0B',
          emerald: '#30D158',
        },
      },
      transitionTimingFunction: {
        raycast: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};

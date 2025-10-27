import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00aaff',
          dark: '#0088cc'
        }
      },
      backdropBlur: {
        xs: '2px'
      }
    },
  },
  plugins: [],
};

export default config;
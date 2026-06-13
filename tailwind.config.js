/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        amazon: {
          navy: '#131921',
          light_navy: '#232f3e',
          orange: '#f97316',
          yellow: '#febd69',
        }
      }
    },
  },
  plugins: [],
}

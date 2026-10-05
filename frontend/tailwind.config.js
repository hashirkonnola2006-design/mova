/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Outfit Variable"', 'Outfit', '"Noto Sans Malayalam"', 'system-ui', 'sans-serif'],
        body: ['Inter', '"Noto Sans Malayalam"', 'system-ui', 'sans-serif'],
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
};

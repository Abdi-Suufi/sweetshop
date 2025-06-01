/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./public/index.html"
    ],
    theme: {
      extend: {
        colors: {
          'primary': '#E91E63', // Pink
          'secondary': '#9C27B0', // Purple
          'accent': '#4CAF50', // Green for actions like "Checkout"
        },
        fontFamily: {
          sans: ['Inter', 'sans-serif'], // Example: Using Inter font
        },
      },
    },
    plugins: [],
  }
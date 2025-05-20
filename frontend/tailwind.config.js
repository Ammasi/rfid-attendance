/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", 
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
    },
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
        lato:['Lato','serif'],
        grechenfuemen: ["Grechen Fuemen", 'sans-serif']
      },
      backgroundImage: {
        'chatbg': "url('/src/assets/doodle.jpg')",
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
};


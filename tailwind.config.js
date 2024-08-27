/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
      },
      backgroundImage: {
        'hero-pattern': "url('./assets/images/fondoRegister.jpg')",
        'fondo-login': "url('./assets/images/fondoLogin.jpg')"

      },
      colors: {
        'line-gray': 'rgba(230, 230, 230, 1)',
        'form-gray': 'rgba(250, 250, 250, 1)'
      }
    },
  },
  plugins: [],

  "styles": [
    "src/styles.css"
  ],
  "postcss": {
    "procesors": [
      require('tailwindcss'),
      require('autoprefixer')
    ]
  }

}

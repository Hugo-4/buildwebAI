/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './devis.html', './mentions-legales.html', './confidentialite.html', './cgv.html', './404.html', './assets/app.js', './assets/devis.js'],
  theme: {
    extend: {
      colors: {
        night: '#081426',
        deep: '#0C1C33',
        line: '#1A2C47',
        ember: '#E62E2D',
        mist: '#EEF2F6',
        steel: '#6A9BC3',
        steeldk: '#365F82',
        ink: '#0B1830',
      },
      fontFamily: { sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'] },
      maxWidth: { wrap: '1240px' },
    },
  },
}

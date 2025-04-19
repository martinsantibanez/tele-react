module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  safelist: [
    {
      pattern: /grid-cols-./
    },
    {
      pattern: /col-span-./
    }
  ],
  theme: {
    extend: {}
  },
  plugins: []
};

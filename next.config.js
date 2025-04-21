/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js'
      }
    }
  },
  async redirects() {
    return [
      {
        source: '/layout',
        destination: '/monitor',
        permanent: true
      },
      {
        source: '/grid',
        destination: '/monitor',
        permanent: true
      }
    ];
  }
};

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
        destination: '/',
        permanent: true
      },
      {
        source: '/grid',
        destination: '/',
        permanent: true
      },
      {
        source: '/monitor',
        destination: '/',
        permanent: true
      },
      {
        source: '/duo',
        destination: '/',
        permanent: true
      }
    ];
  }
};

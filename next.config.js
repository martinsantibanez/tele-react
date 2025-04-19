/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  pageExtensions: ['page.tsx', 'page.ts'],
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

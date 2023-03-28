/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  pageExtensions: ['page.tsx', 'page.ts'],
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    });
    return config;
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

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  experimental: {
    // TypeScript 7 dropped the JS compiler API next build uses by default
    useTypeScriptCli: true
  },
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

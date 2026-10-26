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
  // The OAuth consent screen's homepage: a static file, so its source carries
  // the app's description and the privacy link (see public/about.html).
  async rewrites() {
    return [{ source: '/about', destination: '/about.html' }];
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

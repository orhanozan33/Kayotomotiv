/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // API routes için
  async rewrites() {
    return [
      {
        source: '/admin/:path*',
        destination: '/admin/:path*',
      },
    ];
  },
};

module.exports = nextConfig;


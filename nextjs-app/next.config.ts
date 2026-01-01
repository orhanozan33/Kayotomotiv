import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack config (Next.js 16+)
  turbopack: {},
  // JSON imports are supported by default in Next.js
  // Ensure static assets are properly served
  output: 'standalone',
  // Optimize production builds
  swcMinify: true,
  // Compress responses
  compress: true,
};

export default nextConfig;

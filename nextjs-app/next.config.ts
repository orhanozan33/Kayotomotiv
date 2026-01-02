import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Turbopack config (Next.js 16+)
  turbopack: {},
  // JSON imports are supported by default in Next.js
  
  // Production optimizations
  output: 'standalone',
  // Fix lockfile warning by setting the root directory
  outputFileTracingRoot: path.join(__dirname),
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.in',
      },
    ],
    unoptimized: false,
  },
  
  // Experimental features for better performance
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // Force all API routes to be dynamic to prevent build-time errors
  // This prevents Next.js from trying to statically analyze API routes during build
  async headers() {
    return [];
  },
};

export default nextConfig;

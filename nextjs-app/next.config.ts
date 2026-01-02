import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack config (Next.js 16+)
  turbopack: {},
  // JSON imports are supported by default in Next.js
  
  // Production optimizations
  output: 'standalone',
  
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
  
  // Environment variables that should be available at build time
  env: {
    NODE_ENV: process.env.NODE_ENV || 'production',
  },
  
  // Experimental features for better performance
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;

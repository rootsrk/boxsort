import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only enable static export for production builds
  // This allows dev mode to work normally while still generating static exports for GitHub Pages
  ...(process.env.NODE_ENV === 'production' ? { output: 'export' as const } : {}),
  trailingSlash: false,
  images: {
    unoptimized: true,
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
  },
};

export default nextConfig;

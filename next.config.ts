import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Webpack fallbacks removed to avoid conflicts with Turbopack
  // These were only needed for the 'docx' library client-side compatibility
  // Turbopack handles module resolution differently
  
  // Configure API routes for handling larger files
  experimental: {
    // Enable body size parser for API routes
    serverComponentsExternalPackages: [],
  },
  
  // Configure for production deployment
  productionBrowserSourceMaps: false,
  
  // Headers configuration for API routes
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
        ],
      },
    ];
  },

  // Vercel-specific configuration
  env: {
    VERCEL_URL: process.env.VERCEL_URL,
  },

  // Output configuration for Vercel
  output: 'standalone',
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Webpack fallbacks removed to avoid conflicts with Turbopack
  // These were only needed for the 'docx' library client-side compatibility
  // Turbopack handles module resolution differently
};

export default nextConfig;

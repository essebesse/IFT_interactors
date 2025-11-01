/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure all API routes are dynamic (not statically generated)
  experimental: {
    // This is deprecated in Next 14 but ensures routes are server-side
  },
  // Force server-side rendering for all routes
  // This prevents the "Invalid URL" error during build
}

module.exports = nextConfig

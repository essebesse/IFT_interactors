/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable all static optimization - force everything to be server-side
  // This prevents build-time execution of API routes
  output: 'standalone',

  // Disable static page generation
  // API routes will only run at request time, not build time
  experimental: {
    isrMemoryCacheSize: 0,
  },
}

module.exports = nextConfig

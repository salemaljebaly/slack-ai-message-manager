import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Remove the output: 'export' for development
  // Uncomment this line only when building for production static export
  // output: 'export',

  // Optimize for client-side rendering
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // Remove headers configuration since it doesn't work with static export
  // Handle CORS on the client-side instead
}

// Bundle analyzer configuration
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

export default withBundleAnalyzer(nextConfig)

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: [
      'localhost',
      'images.unsplash.com',
      'via.placeholder.com',
      'picsum.photos',
    ],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  // Enable SWC minification
  swcMinify: true,
  // Enable compression
  compress: true,
  // Enable strict mode
  reactStrictMode: true,
  // Enable ESLint during builds
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Enable TypeScript during builds
  typescript: {
    ignoreBuildErrors: false,
  },
  // Enable trailing slash
  trailingSlash: false,
  // Enable powered by header
  poweredByHeader: false,
}

module.exports = nextConfig
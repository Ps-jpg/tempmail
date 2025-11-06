/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // API routes are now in app/api/, no need for rewrites
  // In production, use Next.js API routes directly
  // In development, you can still use Express server if needed
  async rewrites() {
    // Only proxy to Express server in development if you want to use it
    // Otherwise, use Next.js API routes in app/api/
    if (process.env.NODE_ENV === 'development' && process.env.USE_EXPRESS_SERVER === 'true') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:3001/api/:path*',
        },
      ]
    }
    return []
  },
}

module.exports = nextConfig


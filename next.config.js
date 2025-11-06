/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // API calls use environment variable NEXT_PUBLIC_API_URL
  // If not set, falls back to relative paths (same origin)
  // Set NEXT_PUBLIC_API_URL to your Cloud Run service URL in production
}

module.exports = nextConfig


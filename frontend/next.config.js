/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api',
  },
  images: {
    domains: ['localhost', 'your-s3-bucket.s3.amazonaws.com'],
  },
}

module.exports = nextConfig
/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client', 'prisma'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  // Required for Vercel streaming (Hobby plan = 10s, Pro = 60s)
  // Set per-route via: export const maxDuration = 60
}

module.exports = nextConfig

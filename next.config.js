/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  env: {
    SERVICE_URL: process.env.SERVICE_URL
  },
  typescript: {
    ignoreBuildErrors: true,
    tsconfigPath: './tsconfig.json'
  },
  pageExtensions: ['page.ts', 'page.tsx', 'next.tsx']
};

module.exports = nextConfig;

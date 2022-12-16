/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: false,
  env: {
    SERVICE_URL: process.env.SERVICE_URL
  },
  typescript: {
    ignoreBuildErrors: true,
    tsconfigPath: './tsconfig.json'
  },
  pageExtensions: ['page.ts', 'page.tsx', 'next.tsx', 'next.ts']
};

module.exports = nextConfig;

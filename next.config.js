/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: false,
  env: {
    SERVICE_URL: process.env.SERVICE_URL,
    LOGIN_REDIRECT_URL: process.env.LOGIN_REDIRECT_URL,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_SECRET: process.env.GITHUB_SECRET
  },
  typescript: {
    ignoreBuildErrors: true,
    tsconfigPath: './tsconfig.json'
  },
  pageExtensions: ['page.ts', 'page.tsx', 'next.tsx', 'next.ts']
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  // swcMinify: true,
  env: {
    SERVICE_URL: process.env.SERVICE_URL
  },
  typescript: {
    ignoreBuildErrors: true,
    tsconfigPath: './tsconfig.json'
  }
};

module.exports = nextConfig;

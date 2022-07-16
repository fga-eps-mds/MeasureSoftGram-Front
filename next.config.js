/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    SERVICE_URL: process.env.SERVICE_URL
  }
};

module.exports = nextConfig;

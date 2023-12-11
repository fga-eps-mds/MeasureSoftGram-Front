/** @type {import('next').NextConfig} */
const withTM = require('next-transpile-modules')(['@mui/x-charts'])
const nextConfig = withTM(
  {
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
  pageExtensions: ['page.ts', 'page.tsx', 'next.tsx', 'next.ts'],
  devIndicators: {
    buildActivity: false
  },
  trailingSlash: true,
  modularizeImports: {
    '@mui/material': {
      transform: '@mui/material/{{member}}',
    },
    '@mui/lab': {
      transform: '@mui/lab/{{member}}',
    },
    '@mui/x-charts': {
      transform: '@mui/x-charts/{{member}}',
    },
  },
}
)

module.exports = nextConfig;

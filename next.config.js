/** @type {import('next').NextConfig} */
const withTM = require('next-transpile-modules')(['@mui/x-charts'])
const nextConfig = withTM(
  {
  reactStrictMode: false,
  swcMinify: true,
  compiler: {
    styledComponents: true,
  },
  env: {
    SERVICE_URL: process.env.SERVICE_URL,
    // Compatibilidade com arquivos .env antigos durante a migracao para os
    // nomes NEXT_PUBLIC_* usados explicitamente pelo codigo do navegador.
    NEXT_PUBLIC_LOGIN_REDIRECT_URL:
      process.env.NEXT_PUBLIC_LOGIN_REDIRECT_URL || process.env.LOGIN_REDIRECT_URL,
    NEXT_PUBLIC_GITHUB_CLIENT_ID:
      process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || process.env.GITHUB_CLIENT_ID,
    GITLAB_CLIENT_ID: process.env.GITLAB_CLIENT_ID
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

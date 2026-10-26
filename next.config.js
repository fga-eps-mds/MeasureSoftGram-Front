/** @type {import('next').NextConfig} */
const nextConfig = {
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
  // No `next dev`, cada página compila na primeira visita: com `import { Box } from '@mui/material'` o webpack
  // processava o MUI inteiro (~13 mil módulos) a cada página. No Next 12 o modularizeImports só vale dentro de
  // `experimental`; fora dele era ignorado. Fica fora dos testes, que mocam '@mui/material' inteiro.
  experimental: {
    modularizeImports: process.env.NODE_ENV === 'test' ? undefined : {
      '@mui/material': {
        transform: '@mui/material/{{member}}',
      },
      '@mui/lab': {
        transform: '@mui/lab/{{member}}',
      },
      '@mui/icons-material': {
        transform: '@mui/icons-material/{{member}}',
      },
    },
  },
  // o `next dev` guardava só 2 páginas compiladas e descartava as paradas há 25 s: voltar para uma aba recompilava
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 20,
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // o `next dev` gerava um AGENTS.md na raiz do projeto
  agentRules: false,
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
  trailingSlash: true,
  // o `next dev` guardava só 2 páginas compiladas e descartava as paradas há 25 s: voltar para uma aba recompilava
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 20,
  },
};

module.exports = nextConfig;

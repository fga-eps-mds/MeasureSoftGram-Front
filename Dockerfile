# ============================================================
# Build de producao do Front (Next.js 12). Multi-stage:
#   builder -> instala deps + next build (gera o .next otimizado)
#   runner  -> NODE_ENV=production + next start (serve o build pronto)
#
# Em producao o Next NAO compila pagina on-demand: a home responde de
# imediato. O `next dev` que rodava aqui antes compilava `/` na primeira
# request, estourava o proxy_read_timeout do nginx (504) e reprovava o
# smoke test do deploy.
# ============================================================

# ---------- builder ----------
FROM node:20-alpine AS builder

# build-args inlined no bundle (next.config `env` + prefixo NEXT_PUBLIC_,
# avaliados em build-time). Os defaults sao de desenvolvimento; cada ambiente
# sobrescreve via --build-arg (ver .github/workflows/docker-publish.yml).
# NEXT_PUBLIC_API_URL e a baseURL do axios no browser (src/shared/services/
# api.ts); sem ela as chamadas de API caem no proprio dominio do front.
ARG SERVICE_URL=http://localhost:8080/api
ARG NEXT_PUBLIC_API_URL=http://localhost:8080/api
ARG LOGIN_REDIRECT_URL
ARG GITHUB_CLIENT_ID
ENV SERVICE_URL=$SERVICE_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV LOGIN_REDIRECT_URL=$LOGIN_REDIRECT_URL
ENV GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID
ENV NEXT_TELEMETRY_DISABLED=1

# Dependencias nativas (node-gyp e afins).
RUN apk add --no-cache libc6-compat

WORKDIR /usr/src

# Camada de dependencias: so invalida quando o lockfile muda.
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm@9.0.0 --ignore-scripts && pnpm install --frozen-lockfile --ignore-scripts

# Codigo + build de producao.
COPY . .
RUN pnpm build

# ---------- runner ----------
FROM node:20-alpine AS runner

ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache libc6-compat && npm install -g pnpm@9.0.0

WORKDIR /usr/src

# Artefatos que o `next start` precisa: build, deps, manifestos e estaticos.
COPY --from=builder /usr/src/node_modules ./node_modules
COPY --from=builder /usr/src/.next ./.next
COPY --from=builder /usr/src/public ./public
COPY --from=builder /usr/src/package.json ./package.json
COPY --from=builder /usr/src/next.config.js ./next.config.js

RUN chown -R node:node /usr/src
USER node

EXPOSE 3000

# Servidor de producao (paginas ja compiladas, sem on-demand).
CMD ["pnpm", "start"]

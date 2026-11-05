'use client';

import { useMemo } from 'react';
import { useParams, usePathname, useRouter as useNextRouter, useSearchParams } from 'next/navigation';

type Query = Record<string, string | string[] | undefined>;

const decode = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const withoutTrailingSlash = (path: string) => (path.length > 1 ? path.replace(/\/+$/, '') : path);

/** Parâmetros da rota (`[product]`) e query string num objeto só, como o `router.query` do Pages Router. */
export function useRouteQuery(): Query {
  const params = useParams();
  const searchParams = useSearchParams();

  return useMemo(() => {
    const query: Query = {};

    searchParams?.forEach((value, key) => {
      const current = query[key];
      if (current === undefined) query[key] = value;
      else query[key] = Array.isArray(current) ? [...current, value] : [current, value];
    });

    // o parâmetro da rota prevalece sobre a query string de mesmo nome
    Object.entries(params ?? {}).forEach(([key, value]) => {
      query[key] = Array.isArray(value) ? value.map(decode) : decode(value as string);
    });

    return query;
  }, [params, searchParams]);
}

/** Caminho atual, sem a barra final (o `trailingSlash` do Next a acrescenta) e sem query. */
export function useRoutePath(): string {
  return withoutTrailingSlash(usePathname() ?? '/');
}

const STATIC_RELEASE_SEGMENTS = ['create'];
const STATIC_REPOSITORY_SEGMENTS = ['create', 'manage-repository'];

/** Troca os valores dinâmicos do caminho pelo nome do parâmetro: `/products/1-2-x/releases/3` vira `/products/[product]/releases/[release]`. */
export function toRoutePattern(path: string): string {
  const segments = path.split('/');

  if (segments[1] === 'products' && segments[2] && segments[2] !== 'create') {
    segments[2] = '[product]';

    if (segments[3] === 'releases' && segments[4] && !STATIC_RELEASE_SEGMENTS.includes(segments[4])) {
      segments[4] = '[release]';
    }
    if (segments[3] === 'repositories' && segments[4] && !STATIC_REPOSITORY_SEGMENTS.includes(segments[4])) {
      segments[4] = '[repository]';
    }
  }

  return segments.join('/');
}

/**
 * Mesma forma do `useRouter` do Pages Router (`query`, `pathname`, `asPath`, `isReady`), em cima do `next/navigation`.
 * `push` e `replace` não devolvem mais uma Promise: não dá para esperar a navegação terminar.
 */
export function useRouter() {
  const router = useNextRouter();
  const query = useRouteQuery();
  const path = useRoutePath();
  const searchParams = useSearchParams();
  const search = searchParams?.toString();

  return useMemo(
    () => ({
      push: router.push,
      replace: router.replace,
      back: router.back,
      prefetch: router.prefetch,
      refresh: router.refresh,
      query,
      pathname: toRoutePattern(path),
      asPath: search ? `${path}?${search}` : path,
      isReady: true
    }),
    [router, query, path, search]
  );
}

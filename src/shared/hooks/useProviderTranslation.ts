import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useProviderTerms } from '@hooks/useProviderTerms';

/**
 * Wrapper de `useTranslation` que aplica o contexto do provedor (ex.: chave `foo_gitlab`)
 * e cai na chave base quando não há variante para o provedor atual.
 */
export function useProviderTranslation(ns?: string | string[]) {
  const translation = useTranslation(ns);
  const { i18nContext } = useProviderTerms();
  const { t: baseT } = translation;

  const t = useCallback(
    (key: any, options?: any, ...rest: any[]) => {
      const opts = typeof options === 'object' && options !== null ? { context: i18nContext, ...options } : options;
      return (baseT as any)(key, opts, ...rest);
    },
    [baseT, i18nContext]
  ) as typeof baseT;

  return { ...translation, t };
}

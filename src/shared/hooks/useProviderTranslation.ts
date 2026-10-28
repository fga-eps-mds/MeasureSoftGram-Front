import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useProviderTerms } from '@hooks/useProviderTerms';

const isOptions = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

/**
 * Wrapper de `useTranslation` que aplica o contexto do provedor (ex.: chave `foo_gitlab`)
 * e cai na chave base quando não há variante para o provedor atual.
 *
 * O contexto vai em toda chamada, inclusive em `t('chave')` sem opções; as opções do
 * chamador podem sobrescrevê-lo. Em `t('chave', 'texto padrão', opções)` ele entra nas opções.
 */
export function useProviderTranslation(ns?: string | string[]) {
  const translation = useTranslation(ns);
  const { i18nContext } = useProviderTerms();
  const { t: baseT } = translation;

  const t = useCallback(
    (key: any, options?: any, ...rest: any[]) => {
      if (typeof options === 'string') {
        const [extra, ...others] = rest;
        return (baseT as any)(key, options, { context: i18nContext, ...(isOptions(extra) ? extra : {}) }, ...others);
      }

      const opts = { context: i18nContext, ...(isOptions(options) ? options : {}) };
      return (baseT as any)(key, opts, ...rest);
    },
    [baseT, i18nContext]
  ) as typeof baseT;

  return { ...translation, t };
}

import { useMemo } from 'react';
import { useAuth } from '@contexts/Auth';
import { getI18nContext, getProviderTerms } from '@utils/providerTerminology';

export function useProviderTerms() {
  const { provider } = useAuth();

  return useMemo(
    () => ({ provider, terms: getProviderTerms(provider), i18nContext: getI18nContext(provider) }),
    [provider]
  );
}

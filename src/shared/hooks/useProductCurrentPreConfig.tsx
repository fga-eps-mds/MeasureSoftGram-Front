import useSWR from 'swr';
import api from '@services/api';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { useProductContext } from '@contexts/ProductProvider';
import { Characteristic } from '@customTypes/preConfig';
import useBoolean from './useBoolean';

export function useProductCurrentPreConfig() {
  const { currentOrganization } = useOrganizationContext();
  const { currentProduct } = useProductContext();
  const { value: isLoading, setTrue: setLoading, setFalse: setIsLoadingEnd } = useBoolean(false);

  const { data, error, isValidating } = useSWR<Characteristic[]>(
    `organizations/${currentOrganization?.id}/products/${currentProduct?.id}/current/pre-config/`,
    (url) => {
      setLoading();
      return api
        .get(url)
        .then((response) => response.data?.data?.characteristics ?? [])
        .finally(() => {
          setIsLoadingEnd();
        });
    }
  );

  return {
    data,
    error,
    isLoading,
    isValidating,
    isEmpty: data && !isLoading && !error && !isValidating
  };
}

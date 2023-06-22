import useSWR from 'swr';
import api from '@services/api';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { useProductContext } from '@contexts/ProductProvider';
import { useRepositoryContext } from '@contexts/RepositoryProvider';
import { Latest } from '@customTypes/repository';
import useBoolean from './useBoolean';

export function useRequestLatestValues(value: 'characteristics' | 'subcharacteristics' | 'measures' | 'metrics') {
  const { currentOrganization } = useOrganizationContext();
  const { currentProduct } = useProductContext();
  const { currentRepository } = useRepositoryContext();

  const { value: isLoading, setFalse: setIsLoadingEnd } = useBoolean(true);

  const { data, error, isValidating } = useSWR<{ results: Latest[] }>(
    `organizations/${currentOrganization?.id}` +
      `/products/${currentProduct?.id}` +
      `/repositories/${currentRepository?.id}` +
      `/latest-values/${value}/`,
    (url) =>
      api
        .get(url)
        .then((response) => response.data)
        .finally(() => {
          setIsLoadingEnd();
        }),
    { revalidateOnFocus: false }
  );

  return {
    data: data?.results ?? [],
    error,
    isLoading,
    isValidating,
    isEmpty: data?.results.length === 0 && !isLoading && !error && !isValidating
  };
}

import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { useProductContext } from '@contexts/ProductProvider';
import { Historical } from '@customTypes/repository';
import api from '@services/api';
import useSWR from 'swr';
import useBoolean from './useBoolean';

export const useHistoricalCharacteristics = (repositoryId: string) => {
  const { currentProduct } = useProductContext();
  const { currentOrganization } = useOrganizationContext();
  const { value: isLoading, setFalse: setIsLoadingEnd } = useBoolean(true);

  const organizationId = currentOrganization?.id;
  const productId = currentProduct?.id;

  const { data, error } = useSWR<{ results: Historical[] }>(
    `organizations/${organizationId}` +
      `/products/${productId}` +
      `/repositories/${repositoryId}` +
      `/historical-values/characteristics/`,
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
    isLoading
  };
};

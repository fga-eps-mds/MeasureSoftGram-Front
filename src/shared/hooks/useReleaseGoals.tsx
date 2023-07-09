import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { useProductContext } from '@contexts/ProductProvider';
import useSWR from 'swr';
import api from '@services/api';
import _ from 'lodash';
import { CompareGoalAccomplished } from '@customTypes/product';
import useBoolean from './useBoolean';

export function useReleaseGoals() {
  const { currentOrganization } = useOrganizationContext();
  const { currentProduct } = useProductContext();

  const { value: isLoading, setFalse: setIsLoadingEnd } = useBoolean(true);

  const { data, error, isValidating } = useSWR<{ results: CompareGoalAccomplished[] }>(
    `organizations/${currentOrganization?.id}` +
    `/products/${currentProduct?.id}` +
    `/release/`,
    (url) =>
      api
        .get(url)
        .then((response) => response.data)
        .finally(() => {
          setIsLoadingEnd();
        })
  );

  return {
    data: data?.results ?? [],
    error,
    isLoading,
    isValidating,
  };
}

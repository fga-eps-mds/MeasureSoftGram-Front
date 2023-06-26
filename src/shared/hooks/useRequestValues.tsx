import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { useProductContext } from '@contexts/ProductProvider';
import { useRepositoryContext } from '@contexts/RepositoryProvider';
import useSWR from 'swr';
import { Historical } from '@customTypes/repository';
import api from '@services/api';
import _ from 'lodash';
import useBoolean from './useBoolean';

interface Props {
  type: 'historical-values' | 'latest-values';
  value: 'characteristics' | 'subcharacteristics' | 'measures' | 'metrics';
  addHistoricalSQC?: boolean;
}

export function useRequestValues({ type, value, addHistoricalSQC = false }: Props) {
  const { currentOrganization } = useOrganizationContext();
  const { currentProduct } = useProductContext();
  const { currentRepository, historicalSQC } = useRepositoryContext();

  const { value: isLoading, setFalse: setIsLoadingEnd } = useBoolean(true);

  const { data, error, isValidating } = useSWR<{ results: Historical[] }>(
    `organizations/${currentOrganization?.id}` +
      `/products/${currentProduct?.id}` +
      `/repositories/${currentRepository?.id}` +
      `/${type}/${value}/`,
    (url) =>
      api
        .get(url)
        .then((response) => response.data)
        .finally(() => {
          setIsLoadingEnd();
        }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
      refreshInterval: 0
    }
  );

  if (addHistoricalSQC && !_.find(data?.results, { key: 'SQC' })) {
    data?.results?.push(historicalSQC);
  } else if (!addHistoricalSQC) {
    const index: number = _.findIndex(data?.results, { key: 'SQC' });
    if (index !== -1) data?.results?.splice(index);
  }

  return {
    data: data?.results ?? [],
    error,
    isLoading,
    isValidating,
    isEmpty: data?.results.length === 0 && !isLoading && !error && !isValidating
  };
}

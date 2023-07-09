import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { useProductContext } from '@contexts/ProductProvider';
import { useRepositoryContext } from '@contexts/RepositoryProvider';
import useSWR from 'swr';
import { Historical } from '@customTypes/repository';
import api from '@services/api';
import _ from 'lodash';
import { productQuery } from '@services/product';
import useBoolean from './useBoolean';

interface Props {
  type: 'historical-values' | 'latest-values';
  value: 'characteristics' | 'subcharacteristics' | 'measures' | 'metrics';
  addHistoricalTSQMI?: boolean;
  addCurrentGoal?: boolean;
}

export function useRequestValues({ type, value, addHistoricalTSQMI = false, addCurrentGoal = false }: Props) {
  const { currentOrganization } = useOrganizationContext();
  const { currentProduct } = useProductContext();
  const { currentRepository, historicalTSQMI } = useRepositoryContext();

  const { value: isLoading, setTrue: setLoading, setFalse: setIsLoadingEnd } = useBoolean(false);

  const { data, error, isValidating } = useSWR<{ results: Historical[] }>(
    `organizations/${currentOrganization?.id}` +
    `/products/${currentProduct?.id}` +
    `/repositories/${currentRepository?.id}` +
    `/${type}/${value}/`,
    (url) => {
      setLoading();

      return api
        .get(url)
        .then(async (response) => {
          if (addCurrentGoal && currentOrganization?.id && currentProduct?.id) {
            const { data: currentGoal } = await productQuery.getCurrentReleaseGoal(currentOrganization.id, currentProduct.id);
            response.data?.results?.forEach((res: Historical) => {
              res.goal = currentGoal.data[res.key]
            })
          }

          return response.data
        })
        .finally(() => {
          setIsLoadingEnd();
        });
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
      dedupingInterval: 0,
      errorRetryInterval: 0,
      errorRetryCount: 0
    }
  );

  const returnData = _.cloneDeep(data?.results ?? []);
  if (addHistoricalTSQMI && !_.isEmpty(returnData) && !_.find(returnData, { key: 'TSQMI' })) {
    returnData.push(historicalTSQMI);
  }

  return {
    data: returnData,
    error,
    isLoading,
    isValidating,
    isEmpty: data?.results.length === 0 && !isLoading && !error && !isValidating
  };
}

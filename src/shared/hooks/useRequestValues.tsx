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
  collectionSource?: 'github' | 'sonarqube';
}

export function useRequestValues({
  type,
  value,
  addHistoricalTSQMI = false,
  addCurrentGoal = false,
  collectionSource,
}: Props) {
  const { currentOrganization } = useOrganizationContext();
  const { currentProduct } = useProductContext();
  const { currentRepository, historicalTSQMI } = useRepositoryContext();

  const { value: isLoading, setTrue: setLoading, setFalse: setIsLoadingEnd } = useBoolean(false);

  const { data, error, isValidating } = useSWR<{ results: Historical[] }>(
    currentOrganization?.id && currentProduct?.id && currentRepository?.id
      ? `/v1/organizations/${currentOrganization.id}/products/${currentProduct.id}/repositories/${currentRepository.id}/${type}/${value}/`
      : null,
    (url) => {
      setLoading();

      return api
        .get(url)
        .then(async (response) => {
          if (addCurrentGoal && currentOrganization?.id && currentProduct?.id) {
            try {
              const { data: currentGoal } = await productQuery.getCurrentReleaseGoal(
                currentOrganization.id,
                currentProduct.id
              );
              response.data?.results?.forEach((res: Historical) => {
                res.goal = currentGoal.data[res.key];
              });
            } catch {
              response.data?.results?.forEach((res: Historical) => {
                res.goal = undefined;
              });
            }
          }

          return response.data;
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
      shouldRetryOnError: false
    }
  );


  let returnData = _.cloneDeep(data?.results ?? []);

  if (addHistoricalTSQMI && !_.isEmpty(returnData) && !_.find(returnData, { key: 'TSQMI' })) {
    returnData.push(historicalTSQMI);
  }

  if (returnData?.length && collectionSource) {

    if (collectionSource === 'github') {
      returnData = returnData.filter(
        (res: any) => (res.key === 'total_builds' || res.key === 'sum_ci_feedback_times' || res.key === 'resolved_issues' || res.key === 'total_issues') || res.key === 'ci_feedback_time' || res.key === 'team_throughput'
      );
    }

    if (collectionSource === 'sonarqube') {
      returnData = returnData.filter(
        (res: any) => res.key !== 'total_builds' && res.key !== 'sum_ci_feedback_times' && res.key !== 'resolved_issues' && res.key !== 'total_issues' && res.key !== 'ci_feedback_time' && res.key !== 'team_throughput'
      );
    }
  }

  console.log(collectionSource, returnData);
  return {
    data: returnData,
    error,
    isLoading,
    isValidating,
    isEmpty: data?.results.length === 0 && !isLoading && !error && !isValidating
  };
}

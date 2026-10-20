import { useMemo } from 'react';
import { useRequest } from '@hooks/useRequest';
import { productQuery } from '@services/product';
import { ReleasesPaginated } from '@customTypes/product';
import {
  getRepositoryReleases,
  groupHistoryByRelease,
  HistoryEntity,
  ReleaseWithRepositories,
} from '@utils/groupHistoryByRelease';

export type EvolutionEntity = 'characteristics' | 'subcharacteristics' | 'measures' | 'metrics';

function toArray<T>(data?: T[] | { results?: T[] }): T[] {
  if (Array.isArray(data)) return data;
  return data?.results ?? [];
}

/** Evolução de um nível do modelo em um repositório, com um ponto por release. */
export function useReleaseEvolution(
  organizationId: string,
  productId: string,
  repositoryId: number | undefined,
  entity: EvolutionEntity
) {
  const releasesRequest = useRequest<ReleaseWithRepositories[] | ReleasesPaginated>(
    productQuery.getReleaseList(organizationId, productId)
  );
  const historyRequest = useRequest<{ results: HistoryEntity[] }>(
    productQuery.getRepositoryHistoricalValuesConfig(organizationId, productId, repositoryId, entity)
  );

  const releases = useMemo(
    () => getRepositoryReleases(toArray(releasesRequest.data as ReleaseWithRepositories[]), repositoryId),
    [releasesRequest.data, repositoryId]
  );
  const series = useMemo(
    () => groupHistoryByRelease(toArray(historyRequest.data), releases),
    [historyRequest.data, releases]
  );

  return {
    releaseNames: releases.map((release) => release.release_name),
    series,
    hasReleases: releases.length > 0,
    isLoading: releasesRequest.isLoading || historyRequest.isLoading,
    hasError: !!(releasesRequest.error || historyRequest.error),
    retry: () => {
      void releasesRequest.mutate();
      void historyRequest.mutate();
    },
  };
}

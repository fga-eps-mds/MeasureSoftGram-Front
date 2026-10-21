import { useMemo } from 'react';
import { useRequest } from '@hooks/useRequest';
import { productQuery } from '@services/product';
import { RepositoryReleaseHistory, toReleaseSeries } from '@utils/releaseHistory';

export type EvolutionEntity = 'characteristics' | 'subcharacteristics' | 'measures' | 'metrics';

const LEVELS: Record<EvolutionEntity, 'characteristic' | 'subcharacteristic' | 'measure' | 'metric'> = {
  characteristics: 'characteristic',
  subcharacteristics: 'subcharacteristic',
  measures: 'measure',
  metrics: 'metric'
};

/**
 * Evolução de um nível do modelo em um repositório, com um ponto por release. Vem pronta do release-history do
 * Service (uma requisição de poucos KB); antes o front baixava a lista de releases e o histórico inteiro do nível
 * (até 120 KB nas medidas) para achar o último valor de cada release.
 */
export function useReleaseEvolution(
  organizationId: string,
  productId: string,
  repositoryId: number | undefined,
  entity: EvolutionEntity
) {
  const historyRequest = useRequest<RepositoryReleaseHistory>(
    productQuery.getRepositoryReleaseHistoryConfig(organizationId, productId, repositoryId, LEVELS[entity])
  );
  const { releaseNames, series } = useMemo(() => toReleaseSeries(historyRequest.data), [historyRequest.data]);

  return {
    releaseNames,
    series,
    hasReleases: releaseNames.length > 0,
    isLoading: historyRequest.isLoading,
    hasError: !!historyRequest.error,
    retry: () => {
      void historyRequest.mutate();
    }
  };
}

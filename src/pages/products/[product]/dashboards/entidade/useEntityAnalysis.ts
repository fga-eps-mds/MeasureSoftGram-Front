import { useState } from 'react';
import { useRequest } from '@hooks/useRequest';
import { productQuery } from '@services/product';
import { EntityMatrix, EntityMatrixLevel, IReleases, ReleasesPaginated } from '@customTypes/product';
import { getCurrentRelease, toReleaseArray } from '@utils/releaseSelection';

export function useEntityAnalysis(organizationId: string, productId: string) {
  const [selectedReleaseId, setReleaseId] = useState<number | undefined>();
  // o protótipo abre no nível Medida
  const [level, setLevel] = useState<EntityMatrixLevel>('measure');

  const releasesRequest = useRequest<IReleases[] | ReleasesPaginated>(
    productQuery.getReleaseList(organizationId, productId)
  );
  const releases = toReleaseArray(releasesRequest.data);
  const currentRelease = getCurrentRelease(releases);
  // abre na release atual, como os outros dashboards; a escolha só vale se a release for deste produto
  const releaseId = (releases.find((release) => release.id === selectedReleaseId) ?? currentRelease)?.id;

  const matrixRequest = useRequest<EntityMatrix>(
    productQuery.getEntityMatrix(organizationId, productId, { releaseId, level })
  );

  const retry = () => {
    void releasesRequest.mutate();
    void matrixRequest.mutate();
  };

  return {
    organizationId,
    productId,
    releases,
    releaseId,
    currentReleaseId: currentRelease?.id,
    setReleaseId,
    level,
    setLevel,
    matrix: matrixRequest.data,
    isLoadingReleases: releasesRequest.isLoading,
    isLoading: releasesRequest.isLoading || matrixRequest.isLoading,
    error: releasesRequest.error || matrixRequest.error,
    retry
  };
}

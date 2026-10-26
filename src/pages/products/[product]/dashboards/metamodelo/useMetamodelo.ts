import { useMemo, useState } from 'react';
import { useRequest } from '@hooks/useRequest';
import { productQuery } from '@services/product';
import { IReleases, ReleasesPaginated } from '@customTypes/product';
import { QualityModelNode } from '@customTypes/metamodel';
import { getCurrentRelease, toReleaseArray } from '@utils/releaseSelection';
import { DashboardCardStatus } from '@components/DashboardCard';

/** Árvore do modelo de qualidade da release escolhida (US21.01), que abre na release atual. */
export function useMetamodelo(organizationId: string, productId: string) {
  const releasesRequest = useRequest<IReleases[] | ReleasesPaginated>(
    productQuery.getReleaseList(organizationId, productId)
  );
  const releases = useMemo(() => toReleaseArray(releasesRequest.data), [releasesRequest.data]);
  const currentRelease = useMemo(() => getCurrentRelease(releases), [releases]);

  const [selectedReleaseId, setReleaseId] = useState<number | undefined>();
  // a escolha só vale se a release for deste produto; senão, volta para a atual
  const release = releases.find((item) => item.id === selectedReleaseId) ?? currentRelease;

  const treeRequest = useRequest<QualityModelNode[]>(
    productQuery.getQualityModelTreeConfig(organizationId, productId, release?.id)
  );
  const tree = treeRequest.data?.[0] ?? null;

  const isLoadingReleases = !organizationId || !productId || releasesRequest.isLoading;
  const hasReleases = !isLoadingReleases && !releasesRequest.error && releases.length > 0;

  let status: DashboardCardStatus = 'ready';
  if (releasesRequest.error || treeRequest.error) status = 'error';
  else if (isLoadingReleases || (release && treeRequest.isLoading)) status = 'loading';
  else if (!tree) status = 'empty';

  const retry = () => {
    void releasesRequest.mutate();
    void treeRequest.mutate();
  };

  return {
    releases,
    release,
    currentRelease,
    setReleaseId,
    isLoadingReleases,
    hasReleases,
    tree,
    status,
    retry,
  };
}

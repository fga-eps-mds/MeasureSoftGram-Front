import { useMemo, useState } from 'react';
import { useRequest } from '@hooks/useRequest';
import { productQuery } from '@services/product';
import {
  IReleases,
  ReleaseDashboardCharacteristics,
  ReleaseDashboardSummary,
  ReleasesPaginated
} from '@customTypes/product';
import { getCurrentRelease, getPreviousRelease, toReleaseArray } from '@utils/releaseSelection';

/** Dados da Visão Geral de Qualidade de uma release (US07.01), que abre na release atual. */
export function useOverviewDashboard(organizationId: string, productId: string) {
  const releasesRequest = useRequest<IReleases[] | ReleasesPaginated>(
    productQuery.getReleaseList(organizationId, productId)
  );
  const releases = useMemo(() => toReleaseArray(releasesRequest.data), [releasesRequest.data]);
  const currentRelease = useMemo(() => getCurrentRelease(releases), [releases]);

  const [selectedReleaseId, setSelectedReleaseId] = useState<number | undefined>();
  // a escolha só vale se a release for deste produto; senão, volta para a atual
  const release = releases.find((item) => item.id === selectedReleaseId) ?? currentRelease;
  const previousRelease = useMemo(() => getPreviousRelease(releases, release?.id), [releases, release?.id]);

  const summaryRequest = useRequest<ReleaseDashboardSummary>(
    productQuery.getReleaseDashboardSummary(organizationId, productId, release?.id)
  );
  const characteristicsRequest = useRequest<ReleaseDashboardCharacteristics>(
    productQuery.getReleaseDashboardCharacteristics(organizationId, productId, release?.id)
  );
  // só para a variação do TSQMI no tooltip: se falhar, o gráfico continua sem a variação
  const previousCharacteristicsRequest = useRequest<ReleaseDashboardCharacteristics>(
    productQuery.getReleaseDashboardCharacteristics(organizationId, productId, previousRelease?.id)
  );

  // sem os ids da URL o pedido ainda nem começou, e isso também é carregamento
  const isLoadingReleases = !organizationId || !productId || releasesRequest.isLoading;

  return {
    releases,
    release,
    currentRelease,
    previousRelease,
    setReleaseId: setSelectedReleaseId,
    isLoadingReleases,
    releasesError: releasesRequest.error,
    hasReleases: !isLoadingReleases && !releasesRequest.error && releases.length > 0,
    summary: summaryRequest.data,
    summaryError: summaryRequest.error,
    characteristics: characteristicsRequest.data,
    characteristicsError: characteristicsRequest.error,
    previousCharacteristics: previousCharacteristicsRequest.data,
    retryReleases: () => void releasesRequest.mutate(),
    retrySummary: () => void summaryRequest.mutate(),
    retryCharacteristics: () => {
      void characteristicsRequest.mutate();
      void previousCharacteristicsRequest.mutate();
    }
  };
}

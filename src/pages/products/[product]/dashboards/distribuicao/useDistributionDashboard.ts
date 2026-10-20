import { useMemo, useState } from 'react';
import { useRequest } from '@hooks/useRequest';
import { useRequests } from '@hooks/useRequests';
import { productQuery } from '@services/product';
import {
  FileMetricKey,
  IReleases,
  MetricDistribution,
  MetricDistributionRepository,
  ReleasesPaginated
} from '@customTypes/product';
import { ComparisonRepository } from '@utils/formatDistributionCharts';
import { DEFAULT_FILE_METRIC, getMetricReference } from '@utils/metricDistribution';
import { getCurrentRelease, toReleaseArray } from '@utils/releaseSelection';

export type DistributionView = 'single' | 'comparison';

const NO_REPOSITORIES: MetricDistributionRepository[] = [];

function hasFileData(repository: MetricDistributionRepository): boolean {
  return repository.summary !== null;
}

function toComparisonRepository({
  repository_name: name,
  summary,
  files = []
}: MetricDistributionRepository): ComparisonRepository[] {
  return summary ? [{ name, summary, files }] : [];
}

/**
 * Dados do dashboard de Distribuição das Métricas (US21.03), que abre na release atual e na complexidade. A lista
 * de repositórios vem do endpoint sem repository_id (os mesmos da Análise por Entidade, em ordem de nome); os
 * arquivos vêm com uma requisição por repositório: um na visão de um repositório, todos os com dados na comparação.
 */
export function useDistributionDashboard(organizationId: string, productId: string) {
  const releasesRequest = useRequest<IReleases[] | ReleasesPaginated>(
    productQuery.getReleaseList(organizationId, productId)
  );
  const releases = useMemo(() => toReleaseArray(releasesRequest.data), [releasesRequest.data]);
  const currentRelease = useMemo(() => getCurrentRelease(releases), [releases]);
  const [selectedReleaseId, setReleaseId] = useState<number | undefined>();
  // a escolha só vale se a release for deste produto; senão, volta para a atual
  const release = releases.find((item) => item.id === selectedReleaseId) ?? currentRelease;

  const [metric, setMetric] = useState<FileMetricKey>(DEFAULT_FILE_METRIC);
  const [view, setView] = useState<DistributionView>('single');
  const [selectedRepositoryId, setRepositoryId] = useState<number | undefined>();
  // a página não remonta quando só o produto da URL muda (o item do menu pode levar à mesma rota de outro
  // produto): as escolhas voltam ao padrão, como numa página nova
  const [selectionProductId, setSelectionProductId] = useState(productId);
  if (selectionProductId !== productId) {
    setSelectionProductId(productId);
    setReleaseId(undefined);
    setMetric(DEFAULT_FILE_METRIC);
    setView('single');
    setRepositoryId(undefined);
  }

  const distributionRequest = (repositoryId?: number) =>
    productQuery.getMetricDistribution(organizationId, productId, { releaseId: release?.id, metric, repositoryId });

  // sem repository_id: os repositórios da release com o resumo de cada um. Ao trocar de métrica ou de release, a
  // lista anterior fica no seletor (keepPreviousData) até a nova chegar; o conteúdo só usa a lista atual
  const repositoriesRequest = useRequest<MetricDistribution>(distributionRequest(), { keepPreviousData: true });
  // o keepPreviousData também guarda a lista de outro produto; ela só vale se a release for deste produto
  const list = releases.some((item) => item.id === repositoriesRequest.data?.release.id)
    ? repositoriesRequest.data
    : undefined;
  const isCurrentList = list?.metric === metric && list?.release.id === release?.id;
  const repositoryOptions = useMemo(() => list?.repositories ?? NO_REPOSITORIES, [list]);
  const repositories = isCurrentList ? repositoryOptions : NO_REPOSITORIES;
  const reference = useMemo(
    () => (isCurrentList ? getMetricReference(metric, list?.reference) : null),
    [isCurrentList, metric, list]
  );
  // abre no primeiro repositório com dados por arquivo; a escolha vale enquanto o repositório for da release
  const repository =
    repositoryOptions.find((item) => item.repository_id === selectedRepositoryId) ??
    repositoryOptions.find(hasFileData) ??
    repositoryOptions[0];

  const detailRequest = useRequest<MetricDistribution>(
    view === 'single' && isCurrentList && repository && hasFileData(repository)
      ? distributionRequest(repository.repository_id)
      : null
  );

  // na comparação, os arquivos de cada repositório vêm juntos, para os bigodes e os outliers de cada caixa
  const comparisonRequest = useRequests<MetricDistribution>(
    view === 'comparison' ? repositories.filter(hasFileData).map((item) => distributionRequest(item.repository_id)) : []
  );
  const comparison = useMemo(
    () => comparisonRequest.data?.flatMap((distribution) => distribution.repositories.flatMap(toComparisonRepository)),
    [comparisonRequest.data]
  );

  // sem os ids da URL o pedido ainda nem começou, e isso também é carregamento
  const isLoadingReleases = !organizationId || !productId || releasesRequest.isLoading;

  return {
    releases,
    release,
    currentRelease,
    setReleaseId,
    metric,
    setMetric,
    view,
    setView,
    repositories,
    repositoryOptions,
    repository,
    setRepositoryId,
    reference,
    isLoadingReleases,
    releasesError: releasesRequest.error,
    hasReleases: !isLoadingReleases && !releasesRequest.error && releases.length > 0,
    isLoadingRepositories: isLoadingReleases || (!!release && !isCurrentList && !repositoriesRequest.error),
    repositoriesError: repositoriesRequest.error,
    detail: detailRequest.data?.repositories[0],
    isLoadingDetail: detailRequest.isLoading,
    detailError: detailRequest.error,
    comparison,
    isLoadingComparison: comparisonRequest.isLoading,
    comparisonError: comparisonRequest.error,
    retryReleases: () => void releasesRequest.mutate(),
    retryRepositories: () => void repositoriesRequest.mutate(),
    retryDetail: () => void detailRequest.mutate(),
    retryComparison: () => void comparisonRequest.mutate()
  };
}

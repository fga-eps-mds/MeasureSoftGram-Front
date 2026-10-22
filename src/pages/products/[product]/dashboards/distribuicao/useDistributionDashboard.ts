import { useMemo, useState } from 'react';
import { useRequest } from '@hooks/useRequest';
import { productQuery } from '@services/product';
import { QualityModelNode } from '@customTypes/metamodel';
import {
  AnalysisDistribution,
  DistributionLevel,
  EntityAnalysisCatalog,
  EntityLevel,
  IReleases,
  ReleaseDashboardCharacteristics,
  ReleaseDashboardRepository,
  ReleasesPaginated
} from '@customTypes/product';
import { buildEntitySelectors, EntitySelection, getSelectedEntity, selectEntity } from '@utils/distributionCascade';
import { getCurrentRelease, toReleaseArray } from '@utils/releaseSelection';

/**
 * O que a página mostra: carregando, falha, produto sem release, release sem repositório, nível sem entidade na
 * configuração, entidade sem análise no repositório ou os quadros.
 */
export type DistributionStatus =
  | 'loading'
  | 'error'
  | 'noRelease'
  | 'noRepository'
  | 'noEntities'
  | 'noAnalyses'
  | 'ready';

const NO_REPOSITORIES: ReleaseDashboardRepository[] = [];
const DEFAULT_LEVEL: DistributionLevel = 'tsqmi';

/** Um repositório com TSQMI na janela da release tem pelo menos uma análise nela. */
function hasAnalyses(repository: ReleaseDashboardRepository): boolean {
  return repository.tsqmi.value !== null;
}

/**
 * Dados da Distribuição Estatística (US21.03): os valores de uma entidade do modelo nas análises de um repositório na
 * release. Abre na release atual, no TSQMI e no primeiro repositório da release que tem análise. Os repositórios vêm
 * do mesmo pedido da Visão Geral (os da release, com o TSQMI de cada um), e a cascata de entidades vem da árvore do
 * modelo da release, com as métricas que têm valor por análise. Os quadros da página (histograma, resumo, densidade,
 * dispersão e boxplot) usam a mesma resposta: entity, children e period.
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

  const [selectedRepositoryId, setRepositoryId] = useState<number | undefined>();
  const [level, setLevel] = useState<DistributionLevel>(DEFAULT_LEVEL);
  const [selection, setSelection] = useState<EntitySelection>({});
  // a página não remonta quando só o produto da URL muda (o item do menu pode levar à mesma rota de outro
  // produto): as escolhas voltam ao padrão, como numa página nova
  const [selectionProductId, setSelectionProductId] = useState(productId);
  if (selectionProductId !== productId) {
    setSelectionProductId(productId);
    setReleaseId(undefined);
    setRepositoryId(undefined);
    setLevel(DEFAULT_LEVEL);
    setSelection({});
  }

  // ao trocar de release, a lista anterior fica no seletor (keepPreviousData) até a nova chegar
  const repositoriesRequest = useRequest<ReleaseDashboardCharacteristics>(
    productQuery.getReleaseDashboardCharacteristics(organizationId, productId, release?.id),
    { keepPreviousData: true }
  );
  // o keepPreviousData também guarda a lista de outro produto; ela só vale se a release for deste produto
  const list = releases.some((item) => item.id === repositoriesRequest.data?.release.id)
    ? repositoriesRequest.data
    : undefined;
  const isCurrentList = !!list && list.release.id === release?.id;
  const repositories = list?.repositories ?? NO_REPOSITORIES;
  // a escolha vale enquanto o repositório for da release; senão, o primeiro com análise ou, sem nenhum, o primeiro
  const repository =
    repositories.find((item) => item.id === selectedRepositoryId) ?? repositories.find(hasAnalyses) ?? repositories[0];

  const treeRequest = useRequest<QualityModelNode[]>(
    productQuery.getQualityModelTreeConfig(organizationId, productId, release?.id)
  );
  const entitiesRequest = useRequest<EntityAnalysisCatalog>(
    productQuery.getEntityAnalysisEntities(organizationId, productId, release?.id)
  );
  const trackedMetrics = useMemo(
    () => new Set((entitiesRequest.data?.metric ?? []).map((metric) => metric.key)),
    [entitiesRequest.data]
  );
  const selectors = useMemo(
    () => buildEntitySelectors(treeRequest.data?.[0], level, selection, trackedMetrics),
    [treeRequest.data, level, selection, trackedMetrics]
  );
  const selectedEntity = getSelectedEntity(selectors);
  // o TSQMI não depende da árvore; abaixo dele, a cascata só vale com a árvore e as métricas da release carregadas
  const isCascadeReady = level === 'tsqmi' || (!!treeRequest.data && !!entitiesRequest.data);
  const hasNoEntities = isCascadeReady && level !== 'tsqmi' && !selectedEntity;

  // ao trocar a seleção, os quadros continuam com a resposta anterior (keepPreviousData) até a nova chegar
  const distributionRequest = useRequest<AnalysisDistribution>(
    isCurrentList && isCascadeReady
      ? productQuery.getAnalysisDistribution(organizationId, productId, {
          releaseId: release?.id,
          repositoryId: repository?.id,
          level,
          key: selectedEntity?.key
        })
      : null,
    { keepPreviousData: true }
  );
  const distribution = releases.some((item) => item.id === distributionRequest.data?.release.id)
    ? distributionRequest.data
    : undefined;
  const isUpdating =
    !!distribution &&
    (distribution.release.id !== release?.id ||
      distribution.repository.id !== repository?.id ||
      distribution.level !== level ||
      (level !== 'tsqmi' && distribution.key !== selectedEntity?.key));

  // sem os ids da URL o pedido ainda nem começou, e isso também é carregamento
  const isLoadingReleases = !organizationId || !productId || releasesRequest.isLoading;
  const error =
    releasesRequest.error ||
    repositoriesRequest.error ||
    (level !== 'tsqmi' && (treeRequest.error || entitiesRequest.error)) ||
    distributionRequest.error;

  let status: DistributionStatus = 'loading';
  if (error) status = 'error';
  else if (isLoadingReleases) status = 'loading';
  else if (!releases.length) status = 'noRelease';
  else if (isCurrentList && !repositories.length) status = 'noRepository';
  else if (hasNoEntities) status = 'noEntities';
  else if (distribution) status = distribution.period.count ? 'ready' : 'noAnalyses';

  const retry = () => {
    void releasesRequest.mutate();
    void repositoriesRequest.mutate();
    void treeRequest.mutate();
    void entitiesRequest.mutate();
    void distributionRequest.mutate();
  };

  return {
    releases,
    release,
    currentRelease,
    setReleaseId,
    isLoadingReleases,
    repositories,
    repository,
    setRepositoryId,
    level,
    setLevel,
    /** Um seletor por nível, do topo até o escolhido, com as opções e a entidade em vigor. */
    selectors,
    setEntity: (entityLevel: EntityLevel, key: string) => setSelection(selectEntity(selectors, entityLevel, key)),
    /** Entidade escolhida; undefined no TSQMI, que não tem seletor. */
    selectedEntity,
    /** A resposta inteira do Service, que pode ser a da seleção anterior enquanto a nova carrega (isUpdating). */
    distribution,
    entity: distribution?.entity,
    children: distribution?.children,
    period: distribution?.period,
    status,
    isUpdating,
    retry
  };
}

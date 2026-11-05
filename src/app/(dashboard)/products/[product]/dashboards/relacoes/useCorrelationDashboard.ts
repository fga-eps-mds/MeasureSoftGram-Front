import { useState } from 'react';
import { useRequest } from '@hooks/useRequest';
import { useRepositoryList } from '@hooks/useRepositoryList';
import { productQuery } from '@services/product';
import { CorrelationLevel, RepositoryCorrelation } from '@customTypes/product';

/**
 * O que a página mostra: carregando, falha, produto sem repositório, produto sem release, configuração com menos de
 * 2 entidades no nível, repositório sem análise nas releases, poucas releases com valor ou as matrizes.
 */
export type CorrelationStatus =
  | 'loading'
  | 'error'
  | 'noRepository'
  | 'noRelease'
  | 'noEntities'
  | 'noAnalyses'
  | 'fewReleases'
  | 'ready';

const DEFAULT_LEVEL: CorrelationLevel = 'characteristic';

/** Mínimo de releases com valor para o Service calcular a correlação. */
export const MIN_RELEASES = 3;

function getCorrelationStatus(correlation: RepositoryCorrelation): CorrelationStatus {
  // sem nenhuma release usada nem deixada de fora, o produto não tem release
  if (!correlation.releases.length && !correlation.excluded_releases) return 'noRelease';
  if (correlation.reason === 'insufficient_entities') return 'noEntities';
  if (correlation.reason === 'insufficient_releases') {
    return correlation.releases.length ? 'fewReleases' : 'noAnalyses';
  }
  return 'ready';
}

/**
 * Dados de Relações e Correlações (US21.04): a correlação entre as características (ou subcaracterísticas) de um
 * repositório ao longo das releases. Abre no primeiro repositório do produto e no nível característica. Os
 * repositórios vêm da lista do produto, a mesma entrada do cache usada pela Evolução Temporal.
 */
export function useCorrelationDashboard(organizationId: string, productId: string) {
  const repositoryList = useRepositoryList(organizationId, productId);
  const repositories = repositoryList.repositories ?? [];

  const [selectedRepositoryId, setSelectedRepositoryId] = useState<number | undefined>();
  const [level, setLevel] = useState<CorrelationLevel>(DEFAULT_LEVEL);
  // a página não remonta quando só o produto da URL muda: as escolhas voltam ao padrão, como numa página nova
  const [selectionProductId, setSelectionProductId] = useState(productId);
  if (selectionProductId !== productId) {
    setSelectionProductId(productId);
    setSelectedRepositoryId(undefined);
    setLevel(DEFAULT_LEVEL);
  }

  const repository = repositories.find((item) => item.id === selectedRepositoryId) ?? repositories[0];

  // ao trocar a seleção, as matrizes continuam com a resposta anterior (keepPreviousData) até a nova chegar
  const correlationRequest = useRequest<RepositoryCorrelation>(
    productQuery.getCorrelation(organizationId, productId, { repositoryId: repository?.id, level }),
    { keepPreviousData: true }
  );
  // o keepPreviousData também guarda a resposta de outro produto; ela só vale se o repositório for deste produto
  const correlation = repositories.some((item) => item.id === correlationRequest.data?.repository.id)
    ? correlationRequest.data
    : undefined;
  const isUpdating = !!correlation && (correlation.repository.id !== repository?.id || correlation.level !== level);

  // sem os ids da URL o pedido ainda nem começou, e isso também é carregamento
  const isLoadingRepositories = !organizationId || !productId || repositoryList.isLoading;
  const error = repositoryList.error || correlationRequest.error;

  // enquanto a lista de repositórios carrega, ou sem a resposta da correlação, a página fica em 'loading'
  let status: CorrelationStatus = 'loading';
  if (error) status = 'error';
  else if (!isLoadingRepositories && !repositories.length) status = 'noRepository';
  else if (!isLoadingRepositories && correlation) status = getCorrelationStatus(correlation);

  const retry = () => {
    void repositoryList.mutate();
    void correlationRequest.mutate();
  };

  return {
    repositories,
    repository,
    setRepositoryId: setSelectedRepositoryId,
    level,
    setLevel,
    /** A resposta do Service, que pode ser a da seleção anterior enquanto a nova carrega (isUpdating). */
    correlation,
    status,
    isUpdating,
    retry
  };
}

import { useMemo, useState } from 'react';
import { useRequest } from '@hooks/useRequest';
import { productQuery } from '@services/product';
import { EntityAnalysis, EntityAnalysisCatalog, EntityLevel, IReleases, ReleasesPaginated } from '@customTypes/product';
import { getCurrentRelease, toReleaseArray } from '@utils/releaseSelection';

export function useEntityAnalysis(organizationId: string, productId: string) {
  const [selectedReleaseId, setReleaseId] = useState<number | undefined>();
  const [level, setLevel] = useState<EntityLevel>('characteristic');
  const [selectedEntityKey, setEntityKey] = useState<string | undefined>();

  const releasesRequest = useRequest<IReleases[] | ReleasesPaginated>(
    productQuery.getReleaseList(organizationId, productId)
  );
  const releases = useMemo(() => toReleaseArray(releasesRequest.data), [releasesRequest.data]);
  const currentRelease = useMemo(() => getCurrentRelease(releases), [releases]);
  // abre na release atual, como os outros dashboards; a escolha só vale se a release for deste produto
  const releaseId = (releases.find((release) => release.id === selectedReleaseId) ?? currentRelease)?.id;

  const entitiesRequest = useRequest<EntityAnalysisCatalog>(
    productQuery.getEntityAnalysisEntities(organizationId, productId, releaseId)
  );
  const entities = useMemo(() => entitiesRequest.data?.[level] ?? [], [entitiesRequest.data, level]);

  // a entidade escolhida precisa existir na configuração da release e no nível atual; decidido no
  // mesmo render, para a troca de nível não pedir a entidade do nível anterior
  const entityKey = entities.some((entity) => entity.key === selectedEntityKey)
    ? selectedEntityKey
    : entities[0]?.key;
  // catálogo carregado e sem nenhuma entidade no nível: não há análise para pedir
  const hasNoEntities = entitiesRequest.data !== undefined && entities.length === 0;

  const analysisRequest = useRequest<EntityAnalysis>(
    productQuery.getEntityAnalysis(organizationId, productId, { releaseId, level, key: entityKey })
  );

  const error = releasesRequest.error || entitiesRequest.error || analysisRequest.error;

  const retry = () => {
    void releasesRequest.mutate();
    void entitiesRequest.mutate();
    void analysisRequest.mutate();
  };

  return {
    releases,
    releaseId,
    currentReleaseId: currentRelease?.id,
    setReleaseId,
    level,
    setLevel,
    entities,
    entityKey,
    setEntityKey,
    analysis: analysisRequest.data,
    hasNoEntities,
    isLoadingReleases: releasesRequest.isLoading,
    isLoading: releasesRequest.isLoading || entitiesRequest.isLoading || analysisRequest.isLoading,
    error,
    retry,
  };
}

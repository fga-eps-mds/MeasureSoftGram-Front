import { mutate } from 'swr';
import { useRequest } from '@hooks/useRequest';
import { productQuery } from '@services/product';
import { Repository } from '@customTypes/repository';

interface RepositoryListResponse {
  results: Repository[];
}

// Ao voltar para uma aba, a lista guardada aparece na hora e é conferida em segundo plano. O intervalo curto só junta
// os pedidos do mesmo momento (Layout, página e dashboard pedem a mesma lista).
const REVALIDATE_ON_VISIT = { dedupingInterval: 2000 };

/**
 * Repositórios do produto, numa única entrada do cache do SWR para o app inteiro: a mesma chave da Evolução Temporal,
 * do Layout, da página do produto e da lista de repositórios.
 */
export function useRepositoryList(organizationId?: string, productId?: string) {
  const {
    data,
    error,
    isLoading,
    mutate: mutateList
  } = useRequest<RepositoryListResponse>(
    productQuery.getRepositoriesConfig(organizationId as string, productId as string),
    REVALIDATE_ON_VISIT
  );

  return { repositories: data?.results, error, isLoading, mutate: mutateList };
}

/** Busca a lista de novo depois de criar, editar ou apagar um repositório. */
export function refreshRepositoryList(organizationId: string, productId: string) {
  const request = productQuery.getRepositoriesConfig(organizationId, productId);
  return request ? mutate(JSON.stringify(request)) : Promise.resolve();
}

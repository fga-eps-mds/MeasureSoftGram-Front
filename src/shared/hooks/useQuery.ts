import { useProductContext } from '@contexts/ProductProvider';
import { useRepositoryContext } from '@contexts/RepositoryProvider';
import { productQuery } from '@services/product';
import { useRouter } from 'next/router';
import { repository, Result } from '@services/repository';
import { Repository } from '@customTypes/repository';
import { useEffect } from 'react';
import { getPathId } from '@utils/pathDestructer';
import { refreshRepositoryList, useRepositoryList } from '@hooks/useRepositoryList';

export function useQuery() {
  const { setRepositoryList } = useRepositoryContext();
  const { currentProduct, setCurrentProduct } = useProductContext();
  const { query } = useRouter();
  const [routeOrganizationId, routeProductId] = getPathId(query?.product as string);

  // a lista vem do cache compartilhado: o Layout e a página que também usa este hook fazem um pedido só
  const { repositories } = useRepositoryList(routeOrganizationId, routeProductId);
  useEffect(() => {
    if (repositories) setRepositoryList(repositories);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repositories]);

  const loadRepositoriesNoContext = async (organizationId: string, productId: string): Promise<Repository[]> => {
    try {
      const result = await productQuery.getAllRepositories(organizationId, productId);
      return result.data.results;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const loadProduct = async (organizationId: string, productId: string) => {
    if (currentProduct && String(currentProduct.id) === String(productId)) return;
    try {
      const result = await productQuery.getProductById(organizationId, productId);
      setCurrentProduct(result.value);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRepositoryAction = async (
    action: string,
    organizationId: string,
    productId: string,
    repositoryId: string | undefined,
    data: any
  ): Promise<Result<any>> => {
    try {
      let result: Result<any>;
      if (action === 'create') {
        result = await repository.createRepository(organizationId, productId, data || {});
      } else if (action === 'update' && repositoryId) {
        result = await repository.updateRepository(organizationId, productId, repositoryId, data || {});
      } else if (action === 'delete' && repositoryId) {
        result = await repository.deleteRepository(organizationId, productId, repositoryId);
      } else {
        throw new Error('Invalid action or missing repositoryId.');
      }
      if (result?.type === 'success') void refreshRepositoryList(organizationId, productId);
      return result;
    } catch (error) {
      return { type: 'error', error: new Error(`Failed to ${action} repository.`) };
    }
  };

  useEffect(() => {
    if (routeOrganizationId && routeProductId) {
      loadProduct(routeOrganizationId, routeProductId).catch((error) => console.error(error));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query?.product]);

  return { handleRepositoryAction, loadRepositoriesNoContext, loadProduct };
}

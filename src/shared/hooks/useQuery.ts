import { useProductContext } from '@contexts/ProductProvider';
import { useRepositoryContext } from '@contexts/RepositoryProvider';
import { productQuery } from '@services/product';
import { useRouter } from 'next/router';
import { repository, Result } from '@services/repository';
import { Repository } from '@customTypes/repository';
import { useEffect } from 'react';
import { getPathId } from '@utils/pathDestructer';

export function useQuery() {
  const { setRepositoryList } = useRepositoryContext();
  const { currentProduct, setCurrentProduct } = useProductContext();
  const { query } = useRouter();

  const loadRepositories = async (organizationId: string, productId: string) => {
    try {
      const result = await productQuery.getAllRepositories(organizationId, productId);
      setRepositoryList(result.data.results);
    } catch (error) {
      console.error(error);
    }
  };

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
    try {
      const result = await productQuery.getProductById(organizationId, productId);
      if (!currentProduct || currentProduct?.id !== productId) {
        setCurrentProduct(result.value);
      }
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
      if (action === 'create') {
        return repository.createRepository(organizationId, productId, data || {});
      }
      if (action === 'update' && repositoryId) {
        return repository.updateRepository(organizationId, productId, repositoryId, data || {});
      }
      if (action === 'delete' && repositoryId) {
        return repository.deleteRepository(organizationId, productId, repositoryId);
      }
      throw new Error('Invalid action or missing repositoryId.');
    } catch (error) {
      return { type: 'error', error: new Error(`Failed to ${action} repository.`) };
    }
  };

  useEffect(() => {
    console.log(query);
    const fetchData = async () => {
      if (typeof query?.product === 'string') {
        try {
          const [organizationId, productId] = getPathId(query?.product);
          await loadProduct(organizationId, productId);
          await loadRepositories(organizationId, productId);
        } catch (error) {
          console.error(error);
        }
      }
    };

    console.log('eu ein');

    fetchData().catch((error) => console.error(error));
  }, [query?.product]);

  return { handleRepositoryAction, loadRepositoriesNoContext, loadProduct };
}

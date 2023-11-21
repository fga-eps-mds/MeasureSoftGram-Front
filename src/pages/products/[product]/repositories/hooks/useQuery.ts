import { useProductContext } from '@contexts/ProductProvider';
import { useRepositoryContext } from '@contexts/RepositoryProvider';
import { productQuery } from '@services/product';
import { getPathId } from '@utils/pathDestructer';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { repository, Result } from '@services/repository';

export const useQuery = () => {
  const { setRepositoryList } = useRepositoryContext();
  const { setCurrentProduct } = useProductContext();
  const { query } = useRouter();

  const loadRepositories = async (organizationId: string, productId: string) => {
    try {
      const result = await productQuery.getAllRepositories(organizationId, productId);
      setRepositoryList(result.data.results);
    } catch (error) {
      console.error(error);
    }
  };

  const loadProduct = async (organizationId: string, productId: string) => {
    try {
      const result = await productQuery.getProductById(organizationId, productId);
      setCurrentProduct(result.data);
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
      } else if (action === 'update' && repositoryId) {
        return repository.updateRepository(organizationId, productId, repositoryId, data || {});
      } else if (action === 'delete' && repositoryId) {
        return repository.deleteRepository(organizationId, productId, repositoryId);
      } else {
        throw new Error('Invalid action or missing repositoryId.');
      }
    } catch (error) {
      console.error(error);
      return { type: 'error', error: new Error(`Failed to ${action} repository.`) };
    }
  };

  useEffect(() => {
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

    fetchData().catch((error) => console.error(error));
  }, [query?.product]);

  return { handleRepositoryAction };
};

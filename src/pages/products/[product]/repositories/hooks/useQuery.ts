import { useProductContext } from '@contexts/ProductProvider';
import { useRepositoryContext } from '@contexts/RepositoryProvider';
import { productQuery } from '@services/product';
import { getPathId } from '@utils/pathDestructer';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export const useQuery = () => {
  const { setRepositoryList } = useRepositoryContext();
  const { setCurrentProduct } = useProductContext();
  const { query } = useRouter();

  async function loadRepositories(organizationId: string, productId: string) {
    try {
      const result = await productQuery.getAllRepositories(organizationId, productId as string);
      setRepositoryList(result.data.results);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }

  async function loadProduct(organizationId: string, productId: string) {
    try {
      const result = await productQuery.getProductById(organizationId, productId);
      setCurrentProduct(result.data);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }

  useEffect(() => {
    if (query?.product) {
      const [organizationId, productId] = getPathId(query?.product as string);
      loadProduct(organizationId, productId);
      loadRepositories(organizationId, productId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query?.product]);
};

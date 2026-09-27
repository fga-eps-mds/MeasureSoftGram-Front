import { useEffect } from 'react';

import { useRouter } from 'next/router';

import { productQuery } from '@services/product';

import { useProductContext } from '@contexts/ProductProvider';
import { useRepositoryContext } from '@contexts/RepositoryProvider';

import { getPathId } from '@utils/pathDestructer';

export const useQuery = () => {
  const { setCurrentProduct, currentProduct } = useProductContext();
  const { setRepositoryList, setRepositoriesLatestTsqmi } = useRepositoryContext();

  const { query } = useRouter();

  async function loadProduct(organizationId: string, productId: string) {
    if (currentProduct && String(currentProduct.id) === String(productId)) return;
    try {
      const result = await productQuery.getProductById(organizationId, productId);
      setCurrentProduct(result.value);
    } catch (error) {
      // eslint-disable-next-line no-console
    }
  }

  async function loadRepositoriesLatestTsqmi(organizationId: string, productId: string) {
    try {
      const result = await productQuery.getProductRepositoriesLatestTsqmi(organizationId, productId as string);
      setRepositoriesLatestTsqmi(result.data);
    } catch (error) {
      // eslint-disable-next-line no-console
    }
  }

  async function loadRepositories(organizationId: string, productId: string) {
    try {
      const result = await productQuery.getAllRepositories(organizationId, productId as string);
      setRepositoryList(result.data.results);
    } catch (error) {
      // eslint-disable-next-line no-console
    }
  }

  useEffect(() => {
    if (query?.product) {
      const [organizationId, productId] = getPathId(query?.product as string);

      Promise.all([
        loadProduct(organizationId, productId),
        loadRepositoriesLatestTsqmi(organizationId, productId),
        loadRepositories(organizationId, productId)
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query?.product]);
};

import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import { RepositoriesTsqmiHistory } from '@customTypes/product';
import { productQuery } from '@services/product';

import { useProductContext } from '@contexts/ProductProvider';
import { useRepositoryContext } from '@contexts/RepositoryProvider';

import { getPathId } from '@utils/pathDestructer';

export const useQuery = () => {
  const { setCurrentProduct } = useProductContext();
  const { setRepositoryList, setRepositoriesLatestTsqmi } = useRepositoryContext();
  const [repositoriesTsqmiHistory, setRepositoriesTsqmiHistory] = useState<RepositoriesTsqmiHistory>();

  const { query } = useRouter();

  async function loadProduct(organizationId: string, productId: string) {
    try {
      const result = await productQuery.getProductById(organizationId, productId);
      setCurrentProduct(result.value);
    } catch (error) {
      // eslint-disable-next-line no-console
    }
  }

  async function loadRepositoriesTsqmiHistory(organizationId: string, productId: string) {
    try {
      const result = await productQuery.getProductRepositoriesTsqmiHistory(organizationId, productId as string);
      setRepositoriesTsqmiHistory(result.data);
    } catch (error) {
      // eslint-disable-next-line no-console
    }
  }

  async function loadRepositoriesLatestTsqmi(organizationId: string, productId: string) {
    try {
      const result = await productQuery.getProductRepositoriesLatestTsqmi(organizationId, productId as string);
      console.log(result.data);
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

      loadProduct(organizationId, productId);
      loadRepositoriesTsqmiHistory(organizationId, productId);
      loadRepositoriesLatestTsqmi(organizationId, productId);
      loadRepositories(organizationId, productId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query?.product]);

  return { repositoriesTsqmiHistory };
};

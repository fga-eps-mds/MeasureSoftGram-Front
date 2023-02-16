import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import { RepositoriesSqcHistory } from '@customTypes/product';
import { productQuery } from '@services/product';

import { useProductContext } from '@contexts/ProductProvider';
import { useRepositoryContext } from '@contexts/RepositoryProvider';

import { getPathId } from '@utils/pathDestructer';

export const useQuery = () => {
  const { setCurrentProduct } = useProductContext();
  const { setRepositoryList } = useRepositoryContext();
  const [repositoriesSqcHistory, setRepositoriesSqcHistory] = useState<RepositoriesSqcHistory>();

  const { query } = useRouter();

  async function loadProduct(organizationId: string, productId: string) {
    try {
      const result = await productQuery.getProductById(organizationId, productId);
      setCurrentProduct(result.data);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }

  async function loadRepositoriesSqcHistory(organizationId: string, productId: string) {
    try {
      const result = await productQuery.getProductRepositoriesSqcHistory(organizationId, productId as string);
      setRepositoriesSqcHistory(result.data);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }

  async function loadRepositories(organizationId: string, productId: string) {
    try {
      const result = await productQuery.getAllRepositories(organizationId, productId as string);
      setRepositoryList(result.data.results);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }

  useEffect(() => {
    if (query?.product) {
      const [organizationId, productId] = getPathId(query?.product as string);

      loadProduct(organizationId, productId);
      loadRepositoriesSqcHistory(organizationId, productId);
      loadRepositories(organizationId, productId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query?.product]);

  return { repositoriesSqcHistory };
};

import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import { RepositoriesSqcHistory } from '@customTypes/product';
import { productQuery } from '@services/product';

import { useProductContext } from '@contexts/ProductProvider';
import { useRepositoryContext } from '@contexts/RepositoryProvider';

import { getPathId } from '@utils/pathDestructer';

export const useQuery = () => {
  const { setCurrentProduct } = useProductContext();
  const { updateRepositoryList } = useRepositoryContext();
  const [repositoriesSqcHistory, setRepositoriesSqcHistory] = useState<RepositoriesSqcHistory>();

  const { query } = useRouter();

  async function loadProduct(productId: string) {
    try {
      const result = await productQuery.getProductById('1', productId);
      setCurrentProduct(result.data);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadRepositoriesSqcHistory(productId: string) {
    try {
      const result = await productQuery.getProductRepositoriesSqcHistory('1', productId as string);
      setRepositoriesSqcHistory(result.data);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadRepositories(productId: string) {
    try {
      const result = await productQuery.getAllRepositories('1', productId as string);
      updateRepositoryList(result.data.results);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (query?.product) {
      const productId = getPathId(query?.product as string);

      loadProduct(productId);
      loadRepositoriesSqcHistory(productId);
      loadRepositories(productId);
    }
  }, [query?.product]);

  return { repositoriesSqcHistory };
};

import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import { RepositoriesSqcHistory } from '@customTypes/product';
import { productQuery } from '@services/product';

import { useProductContext } from '@contexts/ProductProvider';
import { useRepositoryContext } from '@contexts/RepositoryProvider';

import { getPathId } from '@utils/pathDestructer';
import { useOrganizationContext } from '@contexts/OrganizationProvider';

export const useQuery = () => {
  const { currentOrganization } = useOrganizationContext();
  const { setCurrentProduct } = useProductContext();
  const { setRepositoryList } = useRepositoryContext();
  const [repositoriesSqcHistory, setRepositoriesSqcHistory] = useState<RepositoriesSqcHistory>();

  const { query } = useRouter();

  async function loadProduct(productId: string) {
    try {
      const result = await productQuery.getProductById(currentOrganization.id, productId);
      setCurrentProduct(result.data);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadRepositoriesSqcHistory(productId: string) {
    try {
      const result = await productQuery.getProductRepositoriesSqcHistory(currentOrganization.id, productId as string);
      setRepositoriesSqcHistory(result.data);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadRepositories(productId: string) {
    try {
      const result = await productQuery.getAllRepositories(currentOrganization.id, productId as string);
      setRepositoryList(result.data.results);
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

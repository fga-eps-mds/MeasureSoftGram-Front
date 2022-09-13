import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import { Product, RepositoriesSqcHistory } from '@customTypes/product';
import { productQuery } from '@services/product';

export const useQuery = () => {
  const [product, setProduct] = useState<Product>();
  const [repositoriesSqcHistory, setRepositoriesSqcHistory] = useState<RepositoriesSqcHistory>();

  const { query } = useRouter();

  function getPathId(name: string) {
    const nameArray = name.split('-');
    return nameArray[0];
  }

  async function loadProduct(productId: string) {
    try {
      const result = await productQuery.getProductById('1', productId);
      setProduct(result.data);
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

  useEffect(() => {
    if (query?.productName) {
      const productId = getPathId(query?.productName as string);

      loadProduct(productId);
      loadRepositoriesSqcHistory(productId);
    }
  }, [query?.productName]);

  return { product, repositoriesSqcHistory };
};

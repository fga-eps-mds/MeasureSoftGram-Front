import { useEffect, useState } from 'react';
import { productQuery } from '@services/product';
import { PreConfigRoot } from '@customTypes/preConfig';

import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { useProductContext } from '@contexts/ProductProvider';
import mockedData from '../utils/mockedData.json';

export const useQuery = () => {
  const { currentOrganization } = useOrganizationContext();
  const { currentProduct } = useProductContext();
  const [preConfig, setPreConfig] = useState<PreConfigRoot>();

  async function loadProduct() {
    try {
      if (currentProduct) {
        const result = (await productQuery.getProductCurrentPreConfig(
          currentOrganization.id,
          currentProduct.id
        )) as unknown as PreConfigRoot;

        setPreConfig(result);
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (currentProduct) loadProduct();
  }, []);

  return preConfig ?? mockedData;
};

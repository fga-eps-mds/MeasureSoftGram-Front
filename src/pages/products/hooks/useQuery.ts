import { useCallback, useEffect } from 'react';

import { productQuery } from '@services/product';
import { organization } from '@services/organization';

import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { useProductContext } from '@contexts/ProductProvider';

export const useQuery = () => {
  const { currentOrganization } = useOrganizationContext();
  const { updateProductList } = useProductContext();

  const loadAllProducts = async () => {
    try {
      const result = await productQuery.getAllProducts(currentOrganization.id);

      updateProductList(result.data.results);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (currentOrganization) {
      loadAllProducts();
    }
  }, [currentOrganization]);
};

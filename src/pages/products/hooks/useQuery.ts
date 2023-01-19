import { useCallback, useEffect } from 'react';

import { productQuery } from '@services/product';
import { organization } from '@services/organization';

import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { useProductContext } from '@contexts/ProductProvider';

export const useQuery = () => {
  const { currentOrganization } = useOrganizationContext();
  const { updateProductList } = useProductContext();
  const { setOrganizationList } = useOrganizationContext();

  const loadAllOrganization = useCallback(async () => {
    try {
      const result = await organization.getAllOrganization();
      setOrganizationList(result.data.results);
    } catch (error) {
      console.error(error);
    }
  }, [setOrganizationList]);

  const loadAllProducts = useCallback(async () => {
    try {
      const result = await productQuery.getAllProducts(currentOrganization.id);

      updateProductList(result.data.results);
    } catch (error) {
      console.error(error);
    }
  }, [currentOrganization, updateProductList]);

  useEffect(() => {
    loadAllOrganization();
  }, [loadAllOrganization]);

  useEffect(() => {
    if (currentOrganization) {
      loadAllProducts();
    }
  }, [currentOrganization, loadAllProducts]);
};

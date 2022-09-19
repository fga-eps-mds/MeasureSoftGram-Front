import { useEffect } from 'react';

import { productQuery } from '@services/product';
import { organization } from '@services/organization';

import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { useProductContext } from '@contexts/ProductProvider';

export const useQuery = () => {
  const { currentOrganization } = useOrganizationContext();
  const { updateProductList } = useProductContext();
  const { setOrganizationList } = useOrganizationContext();

  async function loadAllOrganization() {
    try {
      const result = await organization.getAllOrganization();
      setOrganizationList(result.data.results);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadAllProducts() {
    try {
      const result = await productQuery.getAllProducts(currentOrganization.id);

      updateProductList(result.data.results);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadAllOrganization();
  }, []);

  useEffect(() => {
    console.log(currentOrganization);
    if (currentOrganization) {
      loadAllProducts();
    }
  }, [currentOrganization]);
};

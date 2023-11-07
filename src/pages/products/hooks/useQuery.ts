import { productQuery } from '@services/product';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { useProductContext } from '@contexts/ProductProvider';
import { toast } from 'react-toastify';
import { useEffect } from 'react';

export const useQuery = () => {
  const { currentOrganization } = useOrganizationContext();
  const { updateProductList } = useProductContext();

  const loadAllProducts = async () => {
    if (currentOrganization) {
      try {
        const result = await productQuery.getAllProducts(currentOrganization.id);

        updateProductList(result.data.results);
      } catch (error) {
        toast.error(`${error}`);
      }
    }
  };

  useEffect(() => {
    if (currentOrganization) {
      loadAllProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOrganization]);
};

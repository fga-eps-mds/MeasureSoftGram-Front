import React, { useCallback } from 'react';

import { SelectChangeEvent } from '@mui/material';
import { FiBox, FiRepeat } from 'react-icons/fi';
import { useProductContext } from '@contexts/ProductProvider';
import { useRouter } from 'next/router';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import LetterAvatar from '@components/LetterAvatar';
import SideMenuItem from '../SideMenuItem';

function ProductSelector() {
  const router = useRouter();
  const { productsList, setCurrentProduct } = useProductContext();
  const { currentOrganization } = useOrganizationContext();

  const handleChange = useCallback(
    (event: SelectChangeEvent) => {
      const productId = Number(event.target.value);
      if (!productId || !productsList) return;
      const product = productsList.find((productData) => Number(productData.id) === productId);
      if (product) {
        setCurrentProduct(product);
        router.push(`/products/${currentOrganization?.id}-${product?.id}-${product?.name}`);
      }
    },
    [currentOrganization?.id, productsList, router, setCurrentProduct]
  );

  const getProductId = useCallback((productName: string) => Number(productName.split('-')[1]) || '', []);

  return (
    <SideMenuItem
      startIcon={<LetterAvatar name={currentOrganization?.name} icon={<FiBox />} />}
      text={currentOrganization?.name}
      endIcon={<FiRepeat />}
      tooltip="Seleção de produto"
    />
  );
}

export default ProductSelector;

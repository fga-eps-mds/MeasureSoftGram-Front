import React, { useCallback, useEffect, useState } from 'react';

import { SelectChangeEvent } from '@mui/material';
import { FiBox, FiRepeat } from 'react-icons/fi';
import { useProductContext } from '@contexts/ProductProvider';
import { useRouter } from 'next/router';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import LetterAvatar from '@components/LetterAvatar';
import SideMenuItem from '../SideMenuItem';
import ListSide from '../ListSide/ListSide';
import { Product } from '@customTypes/product';

function ProductSelector() {
  const router = useRouter();
  const [openClose, setToggle] = useState(false)
  const { productsList, setCurrentProduct, currentProduct } = useProductContext();
  const { currentOrganization } = useOrganizationContext();

  const handleClose = () => {
    setToggle(!openClose);
  }
  const handleChange = useCallback(
    (event: SelectChangeEvent) => {
      const productId = Number(event.target.value);
      if (!productId || !productsList) return;
      const product = productsList.find((productData) => Number(productData.id) === productId);
      if (product) {
        setCurrentProduct(product);
      }
    },
    [currentOrganization?.id, productsList, router, setCurrentProduct]
  );

  const handleSetProduct = (item: Product) => {
    let oldproduct = currentProduct;
        setCurrentProduct(item);
        if (oldproduct !== item) {
          router.push(`/products/${currentOrganization?.id}-${item?.id}-${item?.name}`);
        }
  }

  const getProductId = useCallback((productName: string) => Number(productName.split('-')[1]) || '', []);

  return (
    <SideMenuItem
      optype='drawer'
      context={'organization'}
      openState={openClose}
      handleClose={handleClose}
      startIcon={<LetterAvatar name={currentProduct? currentProduct.name : 'S'} icon={<FiBox />} />}
      text={currentProduct? currentProduct.name : 'Selecione Um Produto'}
      endIcon={<FiRepeat />}
      tooltip="Seleção de produto"
      children={<ListSide orgs={productsList || []} 
        title='Selecione o Produto' 
        handleSelection={handleSetProduct}
      />}
    />
  );
}

export default ProductSelector;
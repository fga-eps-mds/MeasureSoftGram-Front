import React, { useCallback } from 'react';

import { Box, MenuItem, SelectChangeEvent, IconButton, FormControl } from '@mui/material';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import AddCircleIcon from '@mui/icons-material/AddCircle';

import { useProductContext } from '@contexts/ProductProvider';

import { useRouter } from 'next/router';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import * as Styles from './styles';

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
    <Box mt="64px" display="flex" alignItems="center">
      <ContentPasteIcon />
      <FormControl>
        <Styles.DropDown
          inputProps={{ 'aria-label': 'Without label' }}
          value={getProductId(router.asPath)}
          displayEmpty
          onChange={handleChange}
        >
          <MenuItem value="" disabled>
            Selecione um produto
          </MenuItem>
          {productsList?.map((product) => (
            <MenuItem value={product?.id} key={product.id}>
              {product.name}
            </MenuItem>
          ))}
        </Styles.DropDown>
      </FormControl>
      <IconButton disabled>
        <AddCircleIcon />
      </IconButton>
    </Box>
  );
}

export default ProductSelector;

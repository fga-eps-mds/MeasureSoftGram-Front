import React, { useState } from 'react';
import Head from 'next/head';

import { Box, Container, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import { MoreVert } from '@mui/icons-material';

import { NextPageWithLayout } from '@pages/_app.next';
import ConfigPage from '@pages/preConfig/ConfigPage';

import { useProductContext } from '@contexts/ProductProvider';

import getLayout from '@components/Layout';
import CardNavigation from '@components/CardNavigation';

import { Product } from '@customTypes/product';

import Skeleton from './components/Skeleton';
import { useQuery } from './hooks/useQuery';

const Products: NextPageWithLayout = () => {
  useQuery();

  const [openConfig, setOpenConfig] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product>();

  const { productsList } = useProductContext();

  const openMenu = Boolean(anchorEl);

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleOpenConfig = (product: Product) => {
    setSelectedProduct(product);
    setOpenConfig(true);
    setAnchorEl(null);
  };

  const getOrganizationId = (product?: Product) => {
    if (product) {
      const url = product.organization[0];
      const urlArray = url.split('/');
      return urlArray.at(-2);
    }
    return '-1';
  };

  if (!productsList) {
    return (
      <Container>
        <Skeleton />
      </Container>
    );
  }

  return (
    <>
      <Head>
        <title> Site do MeasureSoftGram </title>
      </Head>
      <Container>
        <ConfigPage
          isOpen={openConfig}
          onClose={setOpenConfig}
          repoName={selectedProduct?.name}
          productId={selectedProduct?.id ?? '-1'}
          organizationId={getOrganizationId(selectedProduct)}
        />
        <Box display="flex" flexDirection="column">
          <Box display="flex" marginTop="40px" marginBottom="36px">
            <Typography variant="h4" marginRight="10px">
              Hi
            </Typography>
            <Typography variant="h4" fontWeight="300">
              User
            </Typography>
          </Box>

          <Box display="flex">
            {productsList?.map((product) => (
              <Box key={product.id} display="flex" flexDirection="row" paddingRight="20px">
                <CardNavigation
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  url={`/products/${product.id}-${product.name}`}
                />

                <IconButton color="primary" onClick={handleOpenMenu}>
                  <MoreVert />
                </IconButton>

                <Menu
                  id="basic-menu"
                  anchorEl={anchorEl}
                  open={openMenu}
                  onClose={handleCloseMenu}
                  MenuListProps={{
                    'aria-labelledby': 'basic-button'
                  }}
                >
                  <MenuItem onClick={() => handleOpenConfig(product)}>Definir pré configurações</MenuItem>
                </Menu>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </>
  );
};

Products.getLayout = getLayout;

export default Products;

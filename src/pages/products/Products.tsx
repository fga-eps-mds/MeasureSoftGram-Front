import React, { useCallback, useState } from 'react';
import Head from 'next/head';

import { Box, Button, Container, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import MoreVert from '@mui/icons-material/MoreVert';

import { NextPageWithLayout } from '@pages/_app.next';
import ConfigPage from '@modules/preConfig/ConfigPage';

import { useProductContext } from '@contexts/ProductProvider';
import { useOrganizationContext } from '@contexts/OrganizationProvider';

import getLayout from '@components/Layout';
import CardNavigation from '@components/CardNavigation';

import { Product } from '@customTypes/product';

import { useAuth } from '@contexts/Auth';
import { useRouter } from 'next/router';
import Skeleton from './components/Skeleton';
import { useQuery } from './hooks/useQuery';

const Products: NextPageWithLayout = () => {
  useQuery();

  const { currentOrganization } = useOrganizationContext();
  const [openConfig, setOpenConfig] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product>();

  const { session, logout } = useAuth();
  const router = useRouter();

  const { productsList } = useProductContext();

  const openMenu = Boolean(anchorEl);

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>, index: number) => {
    anchorEl[index] = event.currentTarget;
    setAnchorEl([...anchorEl]);
  };

  const handleCloseMenu = (event: any, idx: number) => {
    const array = [...anchorEl];
    array.splice(idx, 1);
    setAnchorEl(array);
  };

  const handleOpenConfig = useCallback(
    (product: Product) => () => {
      setSelectedProduct(product);
      setOpenConfig(true);
      setAnchorEl([]);
    },
    []
  );

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
          <Box display="flex" gap="1rem" marginTop="40px" marginBottom="36px">
            <Box display="flex" alignItems="center">
              <Typography variant="h4" marginRight="10px">
                Hi
              </Typography>
              <Typography variant="h4" fontWeight="300">
                {session?.username}
              </Typography>
            </Box>

            {session?.username && (
              <Button
                variant="contained"
                onClick={() => {
                  logout();
                  router.push('/');
                }}
              >
                Sair
              </Button>
            )}
          </Box>

          <Box display="flex" flexWrap="wrap">
            {productsList?.map((product, index) => (
              <Box key={product.id} display="flex" flexDirection="row" paddingRight="20px" paddingBottom="20px">
                <CardNavigation
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  url={`/products/${currentOrganization.id}-${product.id}-${product.name}`}
                />

                <IconButton color="primary" onClick={(e) => handleOpenMenu(e, index)}>
                  <MoreVert />
                </IconButton>
                {product?.name}
                <Menu
                  id="basic-menu"
                  key={product?.id}
                  anchorEl={anchorEl[index]}
                  open={Boolean(anchorEl[index])}
                  onClick={(event) => handleCloseMenu(event, index)}
                  MenuListProps={{
                    'aria-labelledby': 'basic-button'
                  }}
                >
                  <MenuItem key={product?.id} onClick={handleOpenConfig(product)}>
                    Definir pré configurações
                  </MenuItem>
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

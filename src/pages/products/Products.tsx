import React, { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';

import { Box, Button, Container, Grid, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import MoreVert from '@mui/icons-material/MoreVert';

import { NextPageWithLayout } from '@pages/_app.next';
import ConfigPage from '@modules/preConfig/ConfigPage';

import { useProductContext } from '@contexts/ProductProvider';
import { useOrganizationContext } from '@contexts/OrganizationProvider';

import getLayout from '@components/Layout';
import CardNavigation from '@components/CardNavigation';

import { Product } from '@customTypes/product';

import useRequireAuth from '@hooks/useRequireAuth';
import SearchButton from '@components/SearchButton';
import Skeleton from './components/Skeleton';
import { useQuery } from './hooks/useQuery';

const Products: NextPageWithLayout = () => {
  useQuery();
  useRequireAuth();

  const { organizationList, currentOrganization, setCurrentOrganization } = useOrganizationContext();
  const { productsList } = useProductContext();
  const [openConfig, setOpenConfig] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product>();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(productsList ?? []);

  useEffect(() => {
    if (productsList !== undefined) setFilteredProducts(productsList!);
  }, [productsList]);

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

  const handleProductFilter = (name: string) => {
    if (name == null || name === '') {
      setFilteredProducts(productsList!);
      return;
    }
    const productsWithName =
      productsList?.filter((product: Product) => product.name.toLowerCase().includes(name.toLowerCase())) ?? [];

    setFilteredProducts(productsWithName);
  };

  const handleSelectedOrganization = (organizationId: string) => {
    if (currentOrganization?.id === organizationId) {
      setCurrentOrganization(undefined);
    } else if (organizationList?.length) {
      setCurrentOrganization(organizationList.find((organization) => organization.id === organizationId)!);
    }
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
          <Typography variant="h4" color="#000000cc" fontWeight="semibold" marginTop="30px">
            Organizações
          </Typography>
          <Box display="flex" gap="1rem" marginTop="40px" marginBottom="10px" justifyContent="space-around">
            {organizationList?.map((organization) => (
              <Box
                // eslint-disable-next-line react/no-array-index-key
                key={organization.id}
                display="flex"
                flexDirection="row"
                paddingRight="20px"
                paddingBottom="20px"
                justifyContent="center"
              >
                <Button
                  // eslint-disable-next-line react/no-array-index-key
                  style={{ maxWidth: '280px', maxHeight: '80px', minWidth: '280px', minHeight: '80px' }}
                  size="large"
                  variant={organization.id === currentOrganization?.id ? 'contained' : 'outlined'}
                  id={organization.id}
                  name={organization.name}
                  onClick={() => handleSelectedOrganization(organization.id)}
                >
                  {organization.name}
                </Button>
              </Box>
            ))}
          </Box>
          {currentOrganization && (
            <Box
              display="flex"
              flexDirection="column"
              marginTop="60px"
              padding="36px"
              style={{ backgroundColor: 'white', border: '1px solid #113d4c', borderRadius: '10px' }}
            >
              <Box display="flex" gap="1rem" flexDirection="row">
                <Typography variant="h5" color="#626264cc" fontWeight="semibold">
                  Produtos
                </Typography>
                <Grid container justifyContent="flex-end" marginRight="20px">
                  <SearchButton onInput={(e) => handleProductFilter(e.target.value)} label="Insira o nome do produto" />
                </Grid>
              </Box>

              <Box display="flex" flexWrap="wrap" marginTop="60px" justifyContent="space-around">
                {filteredProducts?.map((product, index) => (
                  <Box key={product.id} display="flex" flexDirection="row" paddingRight="20px" paddingBottom="20px">
                    <CardNavigation
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      url={`/products/${currentOrganization?.id}-${product?.id}-${product?.name}`}
                    />

                    <IconButton color="primary" onClick={(e) => handleOpenMenu(e, index)}>
                      <MoreVert />
                    </IconButton>
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
                        Definir pesos para uma configuração
                      </MenuItem>
                    </Menu>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Container>
    </>
  );
};

Products.getLayout = getLayout;

export default Products;

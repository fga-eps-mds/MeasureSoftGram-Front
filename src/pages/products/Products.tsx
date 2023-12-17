import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { NextPageWithLayout } from '@pages/_app.next';
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

  const {
    organizationList,
    currentOrganization,
    setCurrentOrganizations,
  } = useOrganizationContext();
  const { productsList } = useProductContext();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(
    productsList ?? []
  );

  useEffect(() => {
  }, [currentOrganization]);

  useEffect(() => {
    if (productsList !== undefined) setFilteredProducts(productsList);
  }, [productsList]);

  const handleSelectedOrganization = (organizationId: string) => {

    if (currentOrganization?.id === organizationId) {
      setCurrentOrganizations([]);
    } else if (organizationList?.length) {
      const selectedOrganization = organizationList.find(
        (organization) => organization.id === organizationId
      );
      if (selectedOrganization) {
        setCurrentOrganizations([selectedOrganization]);
      }
    }
  };

  const handleProductFilter = (name: string) => {
    if (name == null || name === '') {
      setFilteredProducts(productsList!);
      return;
    }
    const filtered =
      productsList?.filter((product) =>
        product.name.toLowerCase().includes(name.toLowerCase())
      ) ?? [];
    setFilteredProducts(filtered);
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
        <title>Site do MeasureSoftGram</title>
      </Head>

      <Container maxWidth="lg" style={{ width: '100%' }}>
        <Box display="flex" flexDirection="column">
          <Typography
            variant="h4"
            color="#000000cc"
            fontWeight="semibold"
            marginTop="30px"
            data-testid="organization-title"
          >
            Organizações
          </Typography>

          <Box
            data-testid="organization-box"
            sx={{
              marginTop: '40px',
              padding: '20px 36px',
              overflowX: 'auto',
              overflowY: 'hidden',
              position: 'relative',
            }}
            style={{
              maxHeight: '120px',
            }}
          >
            <Box
              display="flex"
              flexDirection="row"
              style={{
                gap: '1rem',
                padding: '0',
                marginLeft: '-36px',
                boxSizing: 'border-box',
              }}
              sx={{
                '&::-webkit-scrollbar': {
                  height: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f0f0f0',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#b0b0b0',
                  borderRadius: '4px',
                },
                scrollbarColor: '#b0b0b0 #f0f0f0',
                scrollbarWidth: 'thin',
              }}
            >
              {organizationList?.map((organization) => (
                <Button
                  key={organization.id}
                  style={{
                    minWidth: '280px',
                    height: '80px',
                    marginRight: '1rem',
                  }}
                  size="large"
                  variant={
                    organization.id === currentOrganization?.id
                      ? 'contained'
                      : 'outlined'
                  }
                  id={organization.id}
                  name={organization.name}
                  onClick={() => handleSelectedOrganization(organization.id)}
                >
                  {organization.name}
                </Button>
              ))}
            </Box>
          </Box>

          {currentOrganization && (
            <Box
              display="flex"
              flexDirection="column"
              marginTop="20px"
              padding="36px"
              style={{
                backgroundColor: 'white',
                border: '1px solid #113d4c',
                borderRadius: '10px',
                boxSizing: 'border-box',
              }}
            >
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                marginBottom="20px"
              >
                <Typography variant="h5">
                  Organização Atual: {currentOrganization.name}
                </Typography>
                <IconButton
                  color="primary"
                  aria-label="add product"
                  style={{
                    backgroundColor: '#33568E',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                  }}
                >
                  <AddIcon style={{ color: 'white' }} />
                </IconButton>
              </Box>
              <Box
                display="flex"
                gap="1rem"
                flexDirection="row"
                alignItems="center"
                marginBottom="20px"
              >
                <Typography
                  variant="h5"
                  color="#626264cc"
                  fontWeight="semibold"
                >
                  Produtos
                </Typography>
                <Grid container justifyContent="flex-end" marginRight="20px">
                  <SearchButton
                    onInput={(e) =>
                      handleProductFilter(
                        (e.target as HTMLInputElement).value
                      )
                    }
                    label="Insira o nome do produto"
                  />
                </Grid>
              </Box>

              <Box
                display="flex"
                flexWrap="wrap"
                marginTop="20px"
                justifyContent="space-around"
              >
                {filteredProducts?.map((product) => (
                  <CardNavigation
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    url={`/products/${currentOrganization?.id}-${product?.id}-${product?.name}`}
                    style={{
                      paddingRight: '20px',
                      paddingBottom: '20px',
                    }}
                  />
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

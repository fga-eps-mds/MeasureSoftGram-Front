import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { Box, Container, Typography, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import { NextPageWithLayout } from '@pages/_app.next';
import getLayout from '@components/Layout';
import RepositoriesTable from '../components/RepositoriesList/RepositoriesTable';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { useProductContext } from '@contexts/ProductProvider';

const Repositories: NextPageWithLayout = () => {
  const router = useRouter();
  const { currentOrganization } = useOrganizationContext();
  const { currentProduct } = useProductContext();

  const handleAddIconClick = () => {
    if (currentOrganization?.id && currentProduct?.id) {
      router.push(`/products/${currentOrganization.id}-${currentProduct.id}/repositories/manage-repository`);
    } else {
      router.push('/home').catch((error) => console.error(error));
    }
  };

  return (
    <>
      <Head>
        <title>Repositórios</title>
      </Head>

      <Container>
        <Box display="flex" flexDirection="column">
          <Box display="flex" alignItems="center" marginTop="40px" marginBottom="36px">
            <Typography variant="h4" color="#33568E" fontWeight="500">
              Repositórios
            </Typography>
            <IconButton
              color="primary"
              aria-label="add repository"
              style={{
                backgroundColor: '#33568E',
                marginLeft: '12px',
                borderRadius: '50%',
                width: '25px',
                height: '25px',
              }}
              onClick={handleAddIconClick}
            >
              <AddIcon style={{ color: 'white' }} />
            </IconButton>
          </Box>
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          padding="20px"
          style={{ backgroundColor: 'white', border: '1px solid #113d4c80', borderRadius: '10px' }}
        >
          <RepositoriesTable />
        </Box>
      </Container>
    </>
  );
};

Repositories.getLayout = getLayout;

export default Repositories;

import React from 'react';
import Head from 'next/head';

import { Box, Container, Typography } from '@mui/material';

import { NextPageWithLayout } from '@pages/_app.next';

import getLayout from '@components/Layout';

import RepositoriesTable from '../components/RepositoriesList/RepositoriesTable';
import { useQuery } from './hooks/useQuery';

const Repositories: NextPageWithLayout = () => {
  useQuery();

  return (
    <>
      <Head>
        <title> Repositórios </title>
      </Head>

      <Container>
        <Box display="flex" flexDirection="column">
          <Box display="flex" gap="1rem" marginTop="40px" marginBottom="36px">
            <Box display="flex" alignItems="center">
              <Typography variant="h4" marginRight="10px" color="#33568E" fontWeight="500">
                Repositórios
              </Typography>
            </Box>
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

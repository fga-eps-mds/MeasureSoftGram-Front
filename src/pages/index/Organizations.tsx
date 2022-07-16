import type { NextPage } from 'next';

import { Box, Container, Typography } from '@mui/material';

import Layout from '@components/Layout';

import OrganizationsCards from './components/OrganizationsCards';
import Head from 'next/head';

const Organizations: NextPage = () => {
  return (
    <Layout>
      <Head>
        <title>MeasureSoftGram - Organizações</title>
      </Head>

      <Container>
        <Box display="flex" flexDirection="column">
          <Box marginY="60px">
            <Typography variant="h5">Organizações</Typography>
          </Box>

          <OrganizationsCards />
        </Box>
      </Container>
    </Layout>
  );
};

export default Organizations;

import type { NextPage } from 'next';
import Head from 'next/head';

import { Box, Container, Typography } from '@mui/material';

import Layout from '@components/Layout';
import Card from '@components/Card';

const Organizations: NextPage = () => {
  const resultMock = [
    {
      id: 1,
      name: 'MeasureSoftGram'
    }
  ];

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

          <Box display="flex">
            {resultMock.map((organization) => (
              <Card
                key={organization.id}
                id={organization.id}
                name={organization.name}
                url={`/organizations/${organization.id}`}
              />
            ))}
          </Box>
        </Box>
      </Container>
    </Layout>
  );
};

export default Organizations;

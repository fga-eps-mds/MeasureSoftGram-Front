import React from 'react';
import Head from 'next/head';

import { Box, Container, Typography } from '@mui/material';

import CardNavigation from '@components/CardNavigation';
import getLayout from '@components/Layout';
import { NextPageWithLayout } from '@pages/_app';

const Organizations: NextPageWithLayout = () => {
  const resultMock = [
    {
      id: 1,
      name: 'MeasureSoftGram'
    }
  ];

  return (
    <>
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
              <CardNavigation
                key={organization.id}
                id={organization.id}
                name={organization.name}
                url={`/organizations/${organization.id}`}
              />
            ))}
          </Box>
        </Box>
      </Container>
    </>
  );
};

Organizations.getLayout = getLayout;

export default Organizations;

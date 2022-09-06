import React from 'react';
import Head from 'next/head';

import { Box, Typography } from '@mui/material';

import { NextPageWithLayout } from '@pages/_app.next';

import getLayout from '@components/Layout';
import CardNavigation from '@components/CardNavigation';

const Products: NextPageWithLayout = () => {
  const resultMock = [
    {
      id: 1,
      name: '2022-1-MeasureSoftGram-Front'
    }
  ];

  return (
    <>
      <Head>
        <title>MeasureSoftGram - Products</title>
      </Head>

      <Box display="flex" flexDirection="column">
        <Box marginY="60px">
          <Typography variant="h5">Products</Typography>
        </Box>

        <Box display="flex">
          {resultMock.map((project) => (
            <CardNavigation key={project.id} id={project.id} name={project.name} url={`/products/${project.name}`} />
          ))}
        </Box>
      </Box>
    </>
  );
};

Products.getLayout = getLayout;

export default Products;

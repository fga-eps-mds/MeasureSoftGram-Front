import React from 'react';
import Head from 'next/head';

import { Box } from '@mui/material';

import { NextPageWithLayout } from '@pages/_app.next';

import getLayout from '@components/Layout';

import { useQuery } from './hooks/useQuery';
import ProductContent from './components/ProductContent';

const Product: NextPageWithLayout = () => {
  const { repositoriesSqcHistory } = useQuery();

  return (
    <>
      <Head>
        <title>MeasureSoftGram - Product</title>
      </Head>

      <Box>
        <ProductContent repositoriesSqcHistory={repositoriesSqcHistory} />
      </Box>
    </>
  );
};

Product.getLayout = getLayout;

export default Product;

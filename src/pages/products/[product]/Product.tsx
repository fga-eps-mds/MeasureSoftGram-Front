import React from 'react';
import Head from 'next/head';

import { Box } from '@mui/material';

import { NextPageWithLayout } from '@pages/_app.next';

import { useProductContext } from '@contexts/ProductProvider';

import getLayout from '@components/Layout';

import { useQuery } from './hooks/useQuery';
import ProductContent from './components/ProductContent';

const Product: NextPageWithLayout = () => {
  const { repositoriesSqcHistory } = useQuery();
  const { currentProduct } = useProductContext();

  return (
    <>
      <Head>
        <title>MeasureSoftGram - Product</title>
      </Head>

      <Box>
        <ProductContent product={currentProduct} repositoriesSqcHistory={repositoriesSqcHistory} />
      </Box>
    </>
  );
};

Product.getLayout = getLayout;

export default Product;

import React from 'react';
import Head from 'next/head';

import { Container } from '@mui/material';

import { NextPageWithLayout } from '@pages/_app.next';

import getLayout from '@components/Layout';

import { useQuery } from './hooks/useQuery';
import ProductContent from './components/ProductContent';

import * as Styles from './styles';
import RepositoriesList from './components/RepositoriesList';

const Product: NextPageWithLayout = () => {
  const { repositoriesSqcHistory } = useQuery();

  return (
    <>
      <Head>
        <title>MeasureSoftGram - Product</title>
      </Head>

      <Styles.ProductBackground>
        <ProductContent repositoriesSqcHistory={repositoriesSqcHistory} />
        <RepositoriesList />
      </Styles.ProductBackground>
    </>
  );
};

Product.getLayout = getLayout;

export default Product;

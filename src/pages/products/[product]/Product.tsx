import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { NextPageWithLayout } from '@pages/_app.next';
import getLayout from '@components/Layout';
import useRequireAuth from '@hooks/useRequireAuth';
import { useProductContext } from '@contexts/ProductProvider';

import { useTranslation } from 'react-i18next';
import { useQuery } from './hooks/useQuery';
import ProductContent from './components/ProductContent';

const Product: NextPageWithLayout = () => {
  useRequireAuth();
  useQuery();
  const { currentProduct } = useProductContext();
  const router = useRouter();
  const { t } = useTranslation('overview');

  const handleViewRepositories = () => {
    router.push(`/products/${router.query.product}/repositories`);
  };

  const handleViewReleases = () => {
    router.push(`/products/${router.query.product}/releases`);
  };

  return (
    <>
      <Head>
        <title>{currentProduct?.name}</title>
      </Head>

      <ProductContent />

      <div style={{ margin: '20px', paddingLeft: '15px' }}>
        <div style={{ marginBottom: '20px' }}>
          <Typography variant="h5" gutterBottom>
            {t('repo')}
          </Typography>
          <Button variant="contained" color="primary" onClick={handleViewRepositories}>
            {t('repo-button')}
          </Button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <Typography variant="h5" gutterBottom>
            {t('release')}
          </Typography>
          <Button variant="contained" color="primary" onClick={handleViewReleases}>
            {t('release-button')}
          </Button>
        </div>
      </div>

    </>
  );
};

Product.getLayout = getLayout;

export default Product;

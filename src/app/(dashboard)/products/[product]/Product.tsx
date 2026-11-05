'use client';

import React from 'react';
import { useRouter } from '@hooks/useRouter';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import useRequireAuth from '@hooks/useRequireAuth';
import { usePreloadECharts } from '@components/ECharts';
import { useProductContext } from '@contexts/ProductProvider';

import { useProviderTranslation as useTranslation } from '@hooks/useProviderTranslation';
import { useQuery } from './hooks/useQuery';
import ProductContent from './components/ProductContent';

const Product: React.FC = () => {
  useRequireAuth();
  usePreloadECharts();
  useQuery();
  const { currentProduct } = useProductContext();
  const router = useRouter();
  const { t } = useTranslation('overview');

  const handleViewRepositories = () => {
    void router.push(`/products/${router.query.product}/repositories`);
  };

  const handleViewReleases = () => {
    void router.push(`/products/${router.query.product}/releases`);
  };

  return (
    <>
      <title>{currentProduct?.name}</title>

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


export default Product;

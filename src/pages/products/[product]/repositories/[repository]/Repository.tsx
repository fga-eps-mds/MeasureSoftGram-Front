import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Box, CircularProgress, Typography } from '@mui/material';

import { NextPageWithLayout } from '@pages/_app.next';
import useRequireAuth from '@hooks/useRequireAuth';
import Layout from '@components/Layout/Layout';
import ProductConfigFilterProvider from '@contexts/ProductConfigFilterProvider/ProductConfigFilterProvider';
import { useGrafanaDashboard } from '@hooks/useGrafanaDashboard';
import { getPathId } from '@utils/pathDestructer';

const Repository: NextPageWithLayout = () => {
  useRequireAuth();

  const { query } = useRouter();
  const [repositoryId] = getPathId((query?.repository as string) ?? '');

  const { grafanaUrl, loading, error } = useGrafanaDashboard({
    uid: 'saude-qualidade-repo',
    repositoryId: repositoryId ? Number(repositoryId) : undefined,
  });

  return (
    <>
      <Head>
        <title>Repositório</title>
      </Head>

      <Box
        sx={{
          width: '100%',
          height: 'calc(100vh - 64px)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {loading && <CircularProgress />}
        {error && (
          <Typography color="error">Não foi possível carregar o dashboard.</Typography>
        )}
        {grafanaUrl && !loading && (
          <iframe
            src={grafanaUrl}
            title="Saúde de Qualidade por Repositório"
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        )}
      </Box>
    </>
  );
};

Repository.getLayout = function getLayout(page) {
  return (
    <ProductConfigFilterProvider>
      <Layout>{page}</Layout>
    </ProductConfigFilterProvider>
  );
};

export default Repository;

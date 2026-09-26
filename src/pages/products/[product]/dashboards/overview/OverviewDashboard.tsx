import React from 'react';
import Head from 'next/head';
import { Box, CircularProgress, Container, Typography } from '@mui/material';

import { NextPageWithLayout } from '@pages/_app.next';
import getLayout from '@components/Layout';
import useRequireAuth from '@hooks/useRequireAuth';
import { useGrafanaDashboard } from '@hooks/useGrafanaDashboard';

const OverviewDashboard: NextPageWithLayout = () => {
  useRequireAuth();

  const { grafanaUrl, loading, error } = useGrafanaDashboard({
    uid: '5904a9de-7f42-453c-9a93-1175d1fe6918',
  });

  return (
    <>
      <Head>
        <title>Visão Geral de Qualidade</title>
      </Head>

      <Container maxWidth="xl">
        <Box display="flex" flexDirection="column" gap={2} marginTop="40px">
          <Typography variant="h4" color="#33568E" fontWeight="500">
            Visão Geral de Qualidade
          </Typography>

          <Box
            sx={{
              width: '100%',
              height: '80vh',
              border: '1px solid #d0d7de',
              borderRadius: '8px',
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
                title="Visão Geral de Qualidade"
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            )}
          </Box>
        </Box>
      </Container>
    </>
  );
};

OverviewDashboard.getLayout = getLayout;

export default OverviewDashboard;

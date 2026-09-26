import React from 'react';
import Head from 'next/head';
import {
  Box,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';

import { NextPageWithLayout } from '@pages/_app.next';
import getLayout from '@components/Layout';
import useRequireAuth from '@hooks/useRequireAuth';
import { useGrafanaDashboard } from '@hooks/useGrafanaDashboard';

const SaudeDashboard: NextPageWithLayout = () => {
  useRequireAuth();

  const { grafanaUrl, loading, error, repositories, selectedRepoId, setSelectedRepoId } =
    useGrafanaDashboard({ uid: 'saude-qualidade-repo', hasRepoSelector: true });

  return (
    <>
      <Head>
        <title>Saúde de Qualidade por Repositório</title>
      </Head>

      <Container maxWidth="xl">
        <Box display="flex" flexDirection="column" gap={2} marginTop="40px">
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Typography variant="h4" color="#33568E" fontWeight="500">
              Saúde de Qualidade por Repositório
            </Typography>

            {repositories.length > 0 && (
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel>Repositório</InputLabel>
                <Select
                  value={selectedRepoId ?? ''}
                  label="Repositório"
                  onChange={(e) => setSelectedRepoId(Number(e.target.value))}
                >
                  {repositories.map((repo) => (
                    <MenuItem key={repo.id} value={repo.id}>
                      {repo.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>

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
                title="Saúde de Qualidade por Repositório"
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            )}
          </Box>
        </Box>
      </Container>
    </>
  );
};

SaudeDashboard.getLayout = getLayout;

export default SaudeDashboard;

import React from 'react';
import { Box, Container } from '@mui/material';
import { NextPageWithLayout } from '@pages/_app.next';
import getLayout from '@components/Layout';
import useRequireAuth from '@hooks/useRequireAuth';
import GraphicChart from '@components/GraphicChart'
import LatestValueTable from '@components/LatestValueTable';
import Headers from './components/Header';
import { useQuery } from './hooks/useQuery';

const Repository: NextPageWithLayout = () => {
  useRequireAuth();
  useQuery();

  return (
    <Box display="flex" width="100%" flexDirection="row" marginTop="40px" marginBottom="24px">
      <Container sx={{ marginBottom: '150px' }}>
        <Headers />
        <GraphicChart title="Histórico das Características" type='line' value="characteristics" addHistoricalSQC />
        <LatestValueTable title="Características" value="characteristics" />
        <GraphicChart title="MSG - Características" type='msg' value='characteristics' />
        <GraphicChart title="Sub-Características" type='line' value="subcharacteristics" />
        <LatestValueTable title="Sub-Características" value="subcharacteristics" />
        <GraphicChart title="Medidas" type='line' value="measures" />
        <LatestValueTable title="Medidas" value="measures" />
        <GraphicChart title="Métricas" type='line' value="metrics" />
        <LatestValueTable title="Métricas" value="metrics" />
      </Container>
    </Box>
  );
};

Repository.getLayout = getLayout;

export default Repository;

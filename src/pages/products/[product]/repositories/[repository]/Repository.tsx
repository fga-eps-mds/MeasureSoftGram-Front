import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { NextPageWithLayout } from '@pages/_app.next';
import getLayout from '@components/Layout';
import useRequireAuth from '@hooks/useRequireAuth';
import GraphicStackedLine from '@components/GraphicStackedLine/GraphicStackedLine';
import LatestValueTable from '@components/LatestValueTable';
import { useRepositoryContext } from '@contexts/RepositoryProvider';
import { useQuery } from './hooks/useQuery';

const Repository: NextPageWithLayout = () => {
  useRequireAuth();
  useQuery();

  const { currentRepository } = useRepositoryContext();

  return (
    <Box display="flex" width="100%" flexDirection="row" marginTop="40px" marginBottom="24px">
      <Container sx={{ marginBottom: '150px' }}>
        <Box display="flex">
          <Typography variant="h4" marginRight="10px">
            Repositório
          </Typography>
          <Typography variant="h4" fontWeight="300">
            {currentRepository?.name}
          </Typography>
          <Typography variant="caption" color="gray">
            {currentRepository?.description}
          </Typography>
        </Box>
        <GraphicStackedLine title="Caracteríticas" value="characteristics" />
        <LatestValueTable title="Caracteríticas" value="characteristics" />
        <GraphicStackedLine title="Sub-Caracteríticas" value="subcharacteristics" />
        <LatestValueTable title="Sub-Caracteríticas" value="subcharacteristics" />
        <GraphicStackedLine title="Medidas" value="measures" />
        <LatestValueTable title="Medidas" value="measures" />
        <GraphicStackedLine title="Métricas" value="metrics" />
        <LatestValueTable title="Métricas" value="metrics" />
      </Container>
    </Box>
  );
};

Repository.getLayout = getLayout;

export default Repository;

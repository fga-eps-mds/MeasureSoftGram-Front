import React from 'react';
import Head from 'next/head';

import { formatRelative } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Box, Container, Typography } from '@mui/material';
import getLayout from '@components/Layout';

import Circle from './styles';
import { NextPageWithLayout } from '@pages/_app';

const Metrics: NextPageWithLayout = () => {
  const resultMock = {
    id: 1,
    name: '2022-1-MeasureSoftGram-Front-Métricas',
    description: 'Repositório Frontend do software MeasureSoftGram.',
    github_url: 'https://github.com/fga-eps-mds/2022-1-MeasureSoftGram-Front',
    created_at: '2022-07-14T020:00:55.603466',
    updated_at: '2022-07-15T08:58:55.603466'
  };

  const lastUpdateDate = formatRelative(new Date(resultMock.updated_at), new Date(), {
    locale: ptBR
  });

  return (
    <>
      <Head>
        <title>MeasureSoftGram - Projetos</title>
      </Head>

      <Container>
        <Box display="flex" flexDirection="column">
          <Box display="flex" flexDirection="row" alignItems="center" marginY="60px">
            <Circle />

            <Box>
              <Typography variant="h6">{resultMock.name}</Typography>
              <Typography variant="caption">última atualização: {lastUpdateDate}</Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </>
  );
};

Metrics.getLayout = getLayout;

export default Metrics;

import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Alert, Box, Container } from '@mui/material';

import { NextPageWithLayout } from '@pages/_app.next';
import useRequireAuth from '@hooks/useRequireAuth';
import { usePreloadECharts } from '@components/ECharts';
import { ExportAllCsvButton } from '@components/ExportCsvButton';
import Layout from '@components/Layout/Layout';
import ProductConfigFilterProvider from '@contexts/ProductConfigFilterProvider/ProductConfigFilterProvider';
import { useRepositoryContext } from '@contexts/RepositoryProvider';
import { getPathId } from '@utils/pathDestructer';
import { PULSE_CSV, formatRepositoryPulseCsv } from '@utils/formatPulseCsv';
import { useProviderTerms } from '@hooks/useProviderTerms';

import Headers from './components/Header';
import RepositoryPulseChart from './components/RepositoryPulseChart';
import TsqmiBadge from './components/TsqmiBadge';
import { useQuery } from './hooks/useQuery';
import { useRepositoryPulse } from './hooks/useRepositoryPulse';

const Repository: NextPageWithLayout = () => {
  const { terms } = useProviderTerms();
  const { currentRepository, latestTSQMI, latestTSQMIBadgeUrl } = useRepositoryContext();
  useRequireAuth();
  usePreloadECharts();
  const { repositoryNotFound } = useQuery();

  const { query } = useRouter();
  const [organizationId, productId] = getPathId(query?.product as string);
  const [repositoryId] = getPathId((query?.repository as string) ?? '');

  const pulse = useRepositoryPulse(organizationId, productId, repositoryId ? Number(repositoryId) : undefined);
  // o CSV leva o que o card mostra: carregando ou com erro, não exporta nada
  const pulseCsv = formatRepositoryPulseCsv(
    currentRepository?.name ?? '',
    pulse.isLoading || pulse.hasError ? [] : pulse.rows
  );

  if (repositoryNotFound) {
    return (
      <>
        <Head>
          <title>{terms.Repository}</title>
        </Head>
        <Container sx={{ marginTop: '40px' }}>
          <Alert severity="warning">Você não tem acesso a este repositório no {terms.providerName}.</Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{terms.Repository}</title>
      </Head>

      <Box display="flex" width="100%" flexDirection="row" marginTop="40px" marginBottom="24px">
        <Container sx={{ marginBottom: '80px' }}>
          <Box display="flex" flexDirection="column" gap={3} marginX="1%" maxWidth="98%">
            {/* como nos dashboards: o botão do .zip fica à direita da linha do título e desce em tela estreita */}
            <Box display="flex" alignItems="flex-start" justifyContent="space-between" flexWrap="wrap" gap="16px">
              <Box flex="1 1 320px" minWidth={0}>
                <Headers />
              </Box>
              <ExportAllCsvButton dashboard={PULSE_CSV.repository} charts={[pulseCsv]} />
            </Box>

            <TsqmiBadge latestTSQMI={latestTSQMI} latestTSQMIBadgeUrl={latestTSQMIBadgeUrl} />

            <RepositoryPulseChart pulse={pulse} csv={pulseCsv} />

            {/* Lista de arquivos por medida: entra com a TASK23.01.03 */}
            <Box component="section" data-testid="repository-measures-section" />
          </Box>
        </Container>
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

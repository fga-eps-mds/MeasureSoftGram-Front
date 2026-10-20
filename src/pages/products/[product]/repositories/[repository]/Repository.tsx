import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Box, Container } from '@mui/material';

import { NextPageWithLayout } from '@pages/_app.next';
import useRequireAuth from '@hooks/useRequireAuth';
import Layout from '@components/Layout/Layout';
import ReleaseEvolutionChart from '@components/ReleaseEvolutionChart';
import ProductConfigFilterProvider from '@contexts/ProductConfigFilterProvider/ProductConfigFilterProvider';
import { useRepositoryContext } from '@contexts/RepositoryProvider';
import { useReleaseEvolution } from '@hooks/useReleaseEvolution';
import { getPathId } from '@utils/pathDestructer';
import { useProviderTerms } from '@hooks/useProviderTerms';

import Headers from './components/Header';
import TsqmiBadge from './components/TsqmiBadge';
import { useQuery } from './hooks/useQuery';

const Repository: NextPageWithLayout = () => {
  const { terms } = useProviderTerms();
  const { latestTSQMI, latestTSQMIBadgeUrl } = useRepositoryContext();
  useRequireAuth();
  useQuery();

  const { query } = useRouter();
  const [organizationId, productId] = getPathId(query?.product as string);
  const [repositoryId] = getPathId((query?.repository as string) ?? '');

  const { releaseNames, series, hasReleases, isLoading, hasError, retry } = useReleaseEvolution(
    organizationId,
    productId,
    repositoryId ? Number(repositoryId) : undefined,
    'characteristics'
  );

  const emptyMessage = hasReleases
    ? `Nenhuma release tem valores de características deste ${terms.repository}. Eles aparecem depois que a Action do MeasureSoftGram roda dentro do período de uma release.`
    : 'Este produto ainda não tem releases. Crie uma release para acompanhar a evolução por release.';

  return (
    <>
      <Head>
        <title>{terms.Repository}</title>
      </Head>

      <Box display="flex" width="100%" flexDirection="row" marginTop="40px" marginBottom="24px">
        <Container sx={{ marginBottom: '80px' }}>
          <Box display="flex" flexDirection="column" gap={3} marginX="1%" maxWidth="98%">
            <Headers />

            <TsqmiBadge latestTSQMI={latestTSQMI} latestTSQMIBadgeUrl={latestTSQMIBadgeUrl} />

            <ReleaseEvolutionChart
              title="Evolução das características"
              releaseNames={releaseNames}
              series={series}
              isLoading={isLoading}
              hasError={hasError}
              onRetry={retry}
              emptyMessage={emptyMessage}
            />

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

import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Alert, Box, Container, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';

import { NextPageWithLayout } from '@pages/_app.next';
import getLayout from '@components/Layout';
import ReleaseEvolutionChart from '@components/ReleaseEvolutionChart';
import useRequireAuth from '@hooks/useRequireAuth';
import { useProviderTerms } from '@hooks/useProviderTerms';
import { EvolutionEntity, useReleaseEvolution } from '@hooks/useReleaseEvolution';
import { useRepositoryList } from '@hooks/useRepositoryList';
import { Repository } from '@customTypes/repository';
import { getPathId } from '@utils/pathDestructer';

const TITLE = 'Evolução Temporal';
const NO_REPOSITORIES: Repository[] = [];

const CHARTS: { entity: EvolutionEntity; title: string; label: string; normalized: boolean }[] = [
  { entity: 'characteristics', title: 'Características', label: 'características', normalized: true },
  { entity: 'subcharacteristics', title: 'Subcaracterísticas', label: 'subcaracterísticas', normalized: true },
  { entity: 'measures', title: 'Medidas', label: 'medidas', normalized: true },
  { entity: 'metrics', title: 'Métricas', label: 'métricas', normalized: false },
];

interface EvolutionChartProps {
  organizationId: string;
  productId: string;
  repositoryId?: number;
  chart: (typeof CHARTS)[number];
}

function EvolutionChart({ organizationId, productId, repositoryId, chart }: EvolutionChartProps) {
  const { terms } = useProviderTerms();
  const { releaseNames, series, hasReleases, isLoading, hasError, retry } = useReleaseEvolution(
    organizationId,
    productId,
    repositoryId,
    chart.entity
  );

  const emptyMessage = hasReleases
    ? `Nenhuma release tem valores de ${chart.label} deste ${terms.repository}. Eles aparecem depois que a Action do MeasureSoftGram roda dentro do período de uma release.`
    : 'Este produto ainda não tem releases. Crie uma release para acompanhar a evolução por release.';

  return (
    <ReleaseEvolutionChart
      title={chart.title}
      releaseNames={releaseNames}
      series={series}
      isLoading={isLoading}
      hasError={hasError}
      onRetry={retry}
      emptyMessage={emptyMessage}
      normalized={chart.normalized}
    />
  );
}

const TemporalDashboard: NextPageWithLayout = () => {
  const { terms } = useProviderTerms();
  useRequireAuth();

  const { query } = useRouter();
  const [organizationId, productId] = getPathId(query?.product as string);

  // a lista que o Layout já pediu: ao voltar para a aba, os gráficos não esperam por ela
  const { repositories = NO_REPOSITORIES, isLoading: isLoadingRepositories } = useRepositoryList(
    organizationId,
    productId
  );
  const [chosenRepoId, setSelectedRepoId] = useState<number | undefined>();
  // decidido no render: os históricos já saem com o primeiro repositório, sem esperar um efeito
  const selectedRepoId = repositories.some((repository) => repository.id === chosenRepoId)
    ? chosenRepoId
    : repositories[0]?.id;

  return (
    <>
      <Head>
        <title>{TITLE}</title>
      </Head>

      <Container maxWidth="xl">
        <Box display="flex" flexDirection="column" gap={2} marginTop="40px" marginBottom="40px">
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box>
              <Typography variant="h4" color="#33568E" fontWeight="500">
                {TITLE}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Valor de cada entidade na última análise feita dentro do período de cada release.
              </Typography>
            </Box>

            {repositories.length > 0 && (
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel id="temporal-repository">{terms.Repository}</InputLabel>
                <Select
                  labelId="temporal-repository"
                  value={selectedRepoId ?? ''}
                  label={terms.Repository}
                  onChange={(event) => setSelectedRepoId(Number(event.target.value))}
                >
                  {repositories.map((repository) => (
                    <MenuItem key={repository.id} value={repository.id}>
                      {repository.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>

          {!isLoadingRepositories && repositories.length === 0 ? (
            <Alert severity="info">
              Este produto ainda não tem {terms.repositories}. Adicione um {terms.repository} para ver a evolução da
              qualidade.
            </Alert>
          ) : (
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', lg: '1fr 1fr' }} gap={2}>
              {CHARTS.map((chart) => (
                <EvolutionChart
                  key={chart.entity}
                  organizationId={organizationId}
                  productId={productId}
                  repositoryId={selectedRepoId}
                  chart={chart}
                />
              ))}
            </Box>
          )}
        </Box>
      </Container>
    </>
  );
};

TemporalDashboard.getLayout = getLayout;

export default TemporalDashboard;

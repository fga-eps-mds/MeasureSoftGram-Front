import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Container,
  MenuItem,
  SxProps,
  TextField,
  Theme,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';

import { NextPageWithLayout } from '@pages/_app.next';
import getLayout from '@components/Layout';
import DashboardCard from '@components/DashboardCard';
import ReleaseSelect from '@components/ReleaseSelect';
import useRequireAuth from '@hooks/useRequireAuth';
import { useProviderTerms } from '@hooks/useProviderTerms';
import { FileMetricKey } from '@customTypes/product';
import { DASHBOARD_COLORS } from '@utils/dashboardColors';
import { FILE_METRICS } from '@utils/metricDistribution';
import { getPathId } from '@utils/pathDestructer';

import { ChartSkeleton, DistributionErrorCard } from './DistributionStates';
import RepositoriesComparison from './RepositoriesComparison';
import RepositoryDistribution from './RepositoryDistribution';
import { DistributionView, useDistributionDashboard } from './useDistributionDashboard';

const TITLE = '5. Distribuição das Métricas';
const CARD_TITLE = 'Distribuição das Métricas';
const ALL_REPOSITORIES = 'all';
const SELECT_PROPS = { MenuProps: { disableScrollLock: true } };
const TOGGLE_SX: SxProps<Theme> = {
  textTransform: 'none',
  fontWeight: 'bold',
  paddingX: '16px',
  color: DASHBOARD_COLORS.text,
  '&.Mui-selected, &.Mui-selected:hover': { backgroundColor: DASHBOARD_COLORS.primary, color: '#FFFFFF' }
};

const DistributionDashboard: NextPageWithLayout = () => {
  useRequireAuth();
  const { terms } = useProviderTerms();
  const router = useRouter();
  const [organizationId, productId] = getPathId(router.query?.product as string);

  const {
    releases,
    release,
    currentRelease,
    setReleaseId,
    metric,
    setMetric,
    view,
    setView,
    repositories,
    repositoryOptions,
    repository,
    setRepositoryId,
    reference,
    isLoadingReleases,
    releasesError,
    hasReleases,
    isLoadingRepositories,
    repositoriesError,
    detail,
    isLoadingDetail,
    detailError,
    comparison,
    isLoadingComparison,
    comparisonError,
    retryReleases,
    retryRepositories,
    retryDetail,
    retryComparison
  } = useDistributionDashboard(organizationId, productId);

  const repositoryValue = view === 'comparison' ? ALL_REPOSITORIES : repository?.repository_id ?? '';

  // "Todos" abre a comparação, e um repositório abre a visão dele (tela 03)
  const changeRepository = (value: string) => {
    if (value === ALL_REPOSITORIES) {
      setView('comparison');
      return;
    }
    setRepositoryId(Number(value));
    setView('single');
  };

  const renderContent = () => {
    if (releasesError) return <DistributionErrorCard onRetry={retryReleases} />;

    if (!isLoadingReleases && !hasReleases) {
      return (
        <DashboardCard
          title="Produto sem release"
          status="empty"
          badgeLabel="Sem release"
          emptyTitle="Este produto ainda não tem release"
          emptyDescription="A distribuição usa a última coleta dentro da janela de uma release. Planeje a primeira release para começar."
          emptyAction={
            <Button
              variant="contained"
              disableElevation
              onClick={() => void router.push(`/products/${router.query.product}/releases/create`)}
              sx={{ backgroundColor: DASHBOARD_COLORS.primary, fontWeight: 'bold', textTransform: 'none' }}
            >
              Planejar release
            </Button>
          }
        />
      );
    }

    if (repositoriesError) return <DistributionErrorCard onRetry={retryRepositories} />;

    if (isLoadingRepositories || !release) {
      // enquanto a lista da release carrega, o título já nomeia a visão e a métrica (o final acrescenta o repositório ou a release)
      const loadingTitle =
        view === 'comparison' ? `${metric} por ${terms.repository}` : `Distribuição de ${metric} entre os arquivos`;
      return <DashboardCard title={loadingTitle} status="loading" loadingContent={<ChartSkeleton />} />;
    }

    if (!repository) {
      return (
        <DashboardCard
          title={CARD_TITLE}
          status="empty"
          emptyTitle={`Este produto ainda não tem ${terms.repositories}`}
          emptyDescription={`Adicione um ${terms.repository} ao produto e rode a coleta do MeasureSoftGram para ver a distribuição das métricas.`}
        />
      );
    }

    if (view === 'comparison') {
      return (
        <RepositoriesComparison
          metric={metric}
          releaseName={release.release_name}
          repositories={repositories}
          comparison={comparison}
          reference={reference}
          isLoading={isLoadingComparison}
          error={comparisonError}
          onRetry={retryComparison}
        />
      );
    }

    return (
      <RepositoryDistribution
        metric={metric}
        repository={repository}
        detail={detail}
        reference={reference}
        isLoading={isLoadingDetail}
        error={detailError}
        onRetry={retryDetail}
      />
    );
  };

  return (
    <>
      <Head>
        <title>{TITLE}</title>
      </Head>

      <Container maxWidth="xl">
        <Box display="flex" flexDirection="column" gap="28px" marginTop="40px" marginBottom="40px">
          <Typography component="h1" fontWeight="bold" fontSize="30px" color={DASHBOARD_COLORS.primary}>
            {TITLE}
          </Typography>

          <Box display="flex" alignItems="center" flexWrap="wrap" gap="16px">
            <ReleaseSelect
              releases={releases}
              value={release?.id}
              currentReleaseId={currentRelease?.id}
              onChange={setReleaseId}
              disabled={isLoadingReleases}
            />

            <TextField
              select
              size="small"
              label={terms.Repository}
              value={repositoryValue}
              onChange={(event) => changeRepository(String(event.target.value))}
              disabled={repositoryOptions.length === 0}
              sx={{ width: 200, backgroundColor: '#FFFFFF' }}
              SelectProps={SELECT_PROPS}
            >
              <MenuItem value={ALL_REPOSITORIES}>Todos ({repositoryOptions.length})</MenuItem>
              {repositoryOptions.map((item) => (
                <MenuItem key={item.repository_id} value={item.repository_id}>
                  {item.repository_name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              label="Métrica (coletada por arquivo)"
              value={metric}
              onChange={(event) => setMetric(event.target.value as FileMetricKey)}
              sx={{ width: 260, backgroundColor: '#FFFFFF' }}
              SelectProps={SELECT_PROPS}
            >
              {FILE_METRICS.map((item) => (
                <MenuItem key={item.key} value={item.key}>
                  {item.key}
                </MenuItem>
              ))}
            </TextField>

            <ToggleButtonGroup
              exclusive
              size="small"
              value={view}
              onChange={(_event, value: DistributionView | null) => {
                if (value) setView(value);
              }}
              aria-label="Visualização"
              sx={{ marginLeft: { md: 'auto' }, backgroundColor: '#FFFFFF' }}
            >
              <ToggleButton value="single" sx={TOGGLE_SX}>
                Um {terms.repository}
              </ToggleButton>
              <ToggleButton value="comparison" sx={TOGGLE_SX}>
                Comparar {terms.repositories}
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {renderContent()}
        </Box>
      </Container>
    </>
  );
};

DistributionDashboard.getLayout = getLayout;

export default DistributionDashboard;

import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import ReactEcharts, { usePreloadECharts } from '@components/ECharts';
import { useRouter } from 'next/router';
import { Box, Button, Container, Link, MenuItem, Paper, TextField, Typography } from '@mui/material';

import { NextPageWithLayout } from '@pages/_app.next';
import getLayout from '@components/Layout';
import DashboardCard, { dashboardCardSx, SkeletonBlock } from '@components/DashboardCard';
import ReleaseSelect from '@components/ReleaseSelect';
import useRequireAuth from '@hooks/useRequireAuth';
import { useProviderTerms } from '@hooks/useProviderTerms';
import { ReleaseDashboardSummary } from '@customTypes/product';
import { DASHBOARD_COLORS } from '@utils/dashboardColors';
import {
  formatPlannedAccomplishedOptions,
  formatRadarOptions,
  formatTotal,
  formatTsqmiBarOptions,
  getDefaultRadarRepository,
  getTsqmiBars,
  hasCharacteristicValues,
  hasPlannedOrAccomplished
} from '@utils/formatOverviewCharts';
import { getPathId } from '@utils/pathDestructer';

import { useOverviewDashboard } from './useOverviewDashboard';

const TITLE = '1. Visão Geral de Qualidade';
const COLLECTION_GUIDE_URL = 'https://github.com/fga-eps-mds/MeasureSoftGram-Action';
const SKELETON_BAR_WIDTHS = [300, 260, 230, 200, 170, 140];

type CardStatus = 'loading' | 'empty' | 'error' | 'ready';

function getStatus(error: unknown, isLoading: boolean, isEmpty: boolean): CardStatus {
  if (error) return 'error';
  if (isLoading) return 'loading';
  return isEmpty ? 'empty' : 'ready';
}

function CollectionGuideLink() {
  return (
    <Link
      href={COLLECTION_GUIDE_URL}
      target="_blank"
      rel="noopener noreferrer"
      underline="hover"
      fontWeight="bold"
      fontSize="13px"
      color={DASHBOARD_COLORS.primary}
    >
      Ver como configurar a coleta
    </Link>
  );
}

function BarsSkeleton() {
  return (
    <Box display="flex" flexDirection="column" gap="14px" paddingTop="6px">
      {SKELETON_BAR_WIDTHS.map((width) => (
        <Box key={width} display="flex" alignItems="center" gap="12px">
          <SkeletonBlock width={70} height={12} />
          <SkeletonBlock width={width} height={20} />
        </Box>
      ))}
    </Box>
  );
}

interface TotalsProps {
  summary?: ReleaseDashboardSummary;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
}

function Totals({ summary, isLoading, error, onRetry }: TotalsProps) {
  const { terms } = useProviderTerms();

  if (error) {
    return <DashboardCard title="Totais da release" status="error" onRetry={onRetry} />;
  }

  const totals = summary?.totals;
  const items = [
    { label: 'Características', value: totals?.characteristics },
    { label: 'Subcaracterísticas', value: totals?.subcharacteristics },
    { label: 'Medidas', value: totals?.measures },
    { label: 'Métricas', value: totals?.metrics },
    { label: terms.Repositories, value: totals?.repositories },
    { label: 'Arquivos analisados', value: totals?.files }
  ];

  return (
    <Box
      display="grid"
      gridTemplateColumns={{ xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' }}
      gap="16px"
    >
      {items.map((item) => (
        <Paper
          key={item.label}
          elevation={0}
          data-testid="overview-total"
          sx={{ ...dashboardCardSx, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}
        >
          {isLoading || item.value === undefined ? (
            <Box display="flex" flexDirection="column" gap="10px" paddingY="2px">
              <SkeletonBlock width={70} height={22} />
              <SkeletonBlock width={110} height={10} />
            </Box>
          ) : (
            <>
              <Typography fontWeight="bold" fontSize="26px" lineHeight={1.2} color={DASHBOARD_COLORS.primary}>
                {formatTotal(item.value)}
              </Typography>
              <Typography fontSize="12px" color={DASHBOARD_COLORS.mutedText}>
                {item.label}
              </Typography>
            </>
          )}
        </Paper>
      ))}
    </Box>
  );
}

function PlannedAccomplishedLegend() {
  return (
    <Box display="flex" gap="18px" alignItems="center">
      {[
        { label: 'Planejado', color: DASHBOARD_COLORS.planned },
        { label: 'Realizado', color: DASHBOARD_COLORS.accomplished }
      ].map((item) => (
        <Box key={item.label} display="flex" alignItems="center" gap="6px">
          <Box sx={{ width: 12, height: 12, borderRadius: '2px', backgroundColor: item.color }} />
          <Typography fontSize="12px" color={DASHBOARD_COLORS.text}>
            {item.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

const OverviewDashboard: NextPageWithLayout = () => {
  useRequireAuth();
  usePreloadECharts();
  const { terms } = useProviderTerms();
  const router = useRouter();
  const [organizationId, productId] = getPathId(router.query?.product as string);

  const {
    releases,
    release,
    currentRelease,
    previousRelease,
    setReleaseId,
    isLoadingReleases,
    releasesError,
    hasReleases,
    summary,
    summaryError,
    characteristics,
    characteristicsError,
    previousCharacteristics,
    retryReleases,
    retrySummary,
    retryCharacteristics
  } = useOverviewDashboard(organizationId, productId);

  const [selectedRepositoryId, setSelectedRepositoryId] = useState<number | undefined>();

  const repositories = characteristics?.repositories ?? [];
  const radarRepository =
    repositories.find((repository) => repository.id === selectedRepositoryId) ??
    repositories.find((repository) => repository.id === getDefaultRadarRepository(repositories));

  const tsqmiBars = useMemo(
    () => getTsqmiBars(characteristics, previousCharacteristics),
    [characteristics, previousCharacteristics]
  );
  const releaseName = release?.release_name ?? '';

  const isLoadingCharacteristics = isLoadingReleases || (!!release && !characteristics);
  const tsqmiStatus = getStatus(characteristicsError, isLoadingCharacteristics, tsqmiBars.length === 0);
  const radarStatus = getStatus(
    characteristicsError,
    isLoadingCharacteristics,
    !repositories.some((repository) => hasCharacteristicValues(repository))
  );
  const plannedStatus = getStatus(
    characteristicsError,
    isLoadingCharacteristics,
    !hasPlannedOrAccomplished(characteristics?.characteristics ?? [])
  );

  const renderContent = () => {
    if (releasesError) {
      return <DashboardCard title="Releases do produto" status="error" onRetry={retryReleases} />;
    }

    if (!isLoadingReleases && !hasReleases) {
      return (
        <DashboardCard
          title="Visão Geral da release"
          status="empty"
          emptyTitle="Este produto ainda não tem releases"
          emptyDescription="A Visão Geral mostra os dados de uma release. Crie uma release para acompanhar a qualidade do produto."
          emptyAction={
            <Button
              variant="contained"
              disableElevation
              onClick={() => void router.push(`/products/${router.query.product}/releases/create`)}
              sx={{ backgroundColor: DASHBOARD_COLORS.primary, fontWeight: 'bold', textTransform: 'none' }}
            >
              Criar release
            </Button>
          }
        />
      );
    }

    return (
      <>
        <Totals
          summary={summary}
          isLoading={isLoadingReleases || (!!release && !summary)}
          error={summaryError}
          onRetry={retrySummary}
        />

        <Box display="grid" gridTemplateColumns={{ xs: '1fr', lg: '1fr 1fr' }} gap="24px">
          <DashboardCard
            title={`TSQMI por ${terms.repository}`}
            status={tsqmiStatus}
            loadingContent={<BarsSkeleton />}
            emptyDescription={`Rode a coleta do MeasureSoftGram (GitHub Action ou CLI) em pelo menos um ${terms.repository} do produto para ver o TSQMI.`}
            emptyAction={<CollectionGuideLink />}
            onRetry={retryCharacteristics}
          >
            <ReactEcharts
              option={formatTsqmiBarOptions(tsqmiBars, releaseName, previousRelease?.release_name)}
              notMerge
              style={{ height: Math.max(160, tsqmiBars.length * 34 + 40), width: '100%' }}
            />
          </DashboardCard>

          <DashboardCard
            title="Radar das características"
            status={radarStatus}
            loadingContent={<BarsSkeleton />}
            emptyDescription={`Rode a coleta do MeasureSoftGram (GitHub Action ou CLI) em pelo menos um ${terms.repository} do produto para ver o radar.`}
            emptyAction={<CollectionGuideLink />}
            onRetry={retryCharacteristics}
            headerAction={
              <TextField
                select
                size="small"
                label={terms.Repository}
                value={radarRepository?.id ?? ''}
                onChange={(event) => setSelectedRepositoryId(Number(event.target.value))}
                sx={{ width: 220 }}
                SelectProps={{ MenuProps: { disableScrollLock: true } }}
              >
                {repositories.map((repository) => (
                  <MenuItem key={repository.id} value={repository.id}>
                    {repository.name}
                  </MenuItem>
                ))}
              </TextField>
            }
          >
            {radarRepository && hasCharacteristicValues(radarRepository) ? (
              <ReactEcharts
                option={formatRadarOptions(characteristics?.characteristics ?? [], radarRepository)}
                notMerge
                style={{ height: 260, width: '100%' }}
              />
            ) : (
              <Box display="flex" alignItems="center" justifyContent="center" height={260}>
                <Typography fontSize="13px" color={DASHBOARD_COLORS.mutedText} textAlign="center">
                  O {terms.repository} {radarRepository?.name} não tem análise nesta release.
                </Typography>
              </Box>
            )}
            <Typography fontSize="12px" color={DASHBOARD_COLORS.mutedText}>
              Características do {terms.repository} {radarRepository?.name} na release {releaseName}.
            </Typography>
          </DashboardCard>
        </Box>

        <DashboardCard
          title="Planejado × Realizado por característica"
          status={plannedStatus}
          loadingContent={<BarsSkeleton />}
          emptyDescription={`Rode a coleta do MeasureSoftGram (GitHub Action ou CLI) em pelo menos um ${terms.repository} do produto para comparar com o planejado.`}
          emptyAction={<CollectionGuideLink />}
          onRetry={retryCharacteristics}
          headerAction={<PlannedAccomplishedLegend />}
        >
          <ReactEcharts
            option={formatPlannedAccomplishedOptions(characteristics?.characteristics ?? [])}
            notMerge
            style={{ height: 240, width: '100%' }}
          />
          <Typography fontSize="12px" color={DASHBOARD_COLORS.mutedText}>
            Realizado é a média entre os {terms.repositories} com análise na release; passe o mouse para ver a
            dispersão.
          </Typography>
        </DashboardCard>
      </>
    );
  };

  return (
    <>
      <Head>
        <title>Visão Geral de Qualidade</title>
      </Head>

      <Container maxWidth="xl">
        <Box display="flex" flexDirection="column" gap="28px" marginTop="40px" marginBottom="40px">
          <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap="16px">
            <Box>
              <Typography component="h1" fontWeight="bold" fontSize="30px" color={DASHBOARD_COLORS.primary}>
                {TITLE}
              </Typography>
              <Typography fontSize="13px" color={DASHBOARD_COLORS.mutedText}>
                Valores da última análise de cada {terms.repository} feita dentro do período da release.
              </Typography>
            </Box>

            <ReleaseSelect
              releases={releases}
              value={release?.id}
              currentReleaseId={currentRelease?.id}
              onChange={(releaseId) => {
                setReleaseId(releaseId);
                setSelectedRepositoryId(undefined);
              }}
              disabled={isLoadingReleases}
            />
          </Box>

          {renderContent()}
        </Box>
      </Container>
    </>
  );
};

OverviewDashboard.getLayout = getLayout;

export default OverviewDashboard;

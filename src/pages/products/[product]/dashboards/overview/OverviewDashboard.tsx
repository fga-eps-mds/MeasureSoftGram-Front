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
import PlannedVsAccomplishedEqualizer from '@components/PlannedVsAccomplishedEqualizer';
import { comparePlannedAccomplished } from '@utils/comparePlannedAccomplished';
import {
  formatRadarOptions,
  formatTotal,
  formatTsqmiBarOptions,
  getDefaultAnalysisRepository,
  getTsqmiBars,
  hasAccomplishedValues
} from '@utils/formatOverviewCharts';
import { getPathId } from '@utils/pathDestructer';
import { QUALITY_BANDS, formatQualityBandRange } from '@utils/qualityBands';
import { useTranslation } from 'react-i18next';
import MSGAlert from '../../../../../components/idv/feedback';

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

/** Legenda das 5 faixas do Indicador Total da Qualidade (US06.01), da melhor para a pior. */
function QualityBandsLegend() {
  return (
    <Box display="flex" flexDirection="column" gap="8px" data-testid="quality-bands-legend">
      <Typography fontWeight="bold" fontSize="13px" color={DASHBOARD_COLORS.text}>
        Faixas
      </Typography>
      {[...QUALITY_BANDS].reverse().map((band) => (
        <Box key={band.grade} display="flex" alignItems="center" gap="8px">
          <Box sx={{ width: 14, height: 14, borderRadius: '3px', backgroundColor: band.color, flexShrink: 0 }} />
          <Typography fontSize="12px" color={DASHBOARD_COLORS.text}>
            {band.grade} · {band.label} ({formatQualityBandRange(band)})
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
    analysis,
    analysisError,
    retryReleases,
    retrySummary,
    retryCharacteristics,
    retryAnalysis
  } = useOverviewDashboard(organizationId, productId);

  const { t } = useTranslation('release');
  const characteristicName = (key: string) => {
    const translated = t(`characteristics.${key}`);
    return translated && translated !== `characteristics.${key}` ? translated : key;
  };

  // o mesmo seletor comanda o equalizador e o radar, como na tela da release
  const [selectedRepositoryName, setSelectedRepositoryName] = useState<string | undefined>();
  const analysisRepositories = analysis?.accomplished ?? [];
  const planned = analysis?.planned ?? [];
  const selectedRepository =
    analysisRepositories.find((repository) => repository.repository_name === selectedRepositoryName) ??
    analysisRepositories.find(
      (repository) => repository.repository_name === getDefaultAnalysisRepository(analysisRepositories)
    );
  const comparisons = useMemo(
    () => comparePlannedAccomplished(planned, selectedRepository?.characteristics),
    [planned, selectedRepository]
  );

  const tsqmiBars = useMemo(
    () => getTsqmiBars(characteristics, previousCharacteristics),
    [characteristics, previousCharacteristics]
  );
  const releaseName = release?.release_name ?? '';

  const isLoadingCharacteristics = isLoadingReleases || (!!release && !characteristics);
  const tsqmiStatus = getStatus(characteristicsError, isLoadingCharacteristics, tsqmiBars.length === 0);
  const analysisStatus = getStatus(
    analysisError,
    isLoadingReleases || (!!release && !analysis),
    analysisRepositories.length === 0
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

        <DashboardCard
          title="Indicador Total da Qualidade"
          status={tsqmiStatus}
          loadingContent={<BarsSkeleton />}
          emptyDescription={`Rode a coleta do MeasureSoftGram (GitHub Action ou CLI) em pelo menos um ${terms.repository} do produto para ver o indicador.`}
          emptyAction={<CollectionGuideLink />}
          onRetry={retryCharacteristics}
        >
          <Box display="flex" flexWrap="wrap" alignItems="center" gap="32px">
            <Box flex="1 1 480px" minWidth={0}>
              <ReactEcharts
                option={formatTsqmiBarOptions(tsqmiBars, releaseName, previousRelease?.release_name)}
                notMerge
                style={{ height: Math.max(160, tsqmiBars.length * 34 + 40), width: '100%' }}
              />
            </Box>
            <QualityBandsLegend />
          </Box>
        </DashboardCard>

        <DashboardCard
          title={`Planejado × Realizado do ${terms.repository}`}
          status={analysisStatus}
          loadingContent={<BarsSkeleton />}
          emptyDescription={`Rode a coleta do MeasureSoftGram (GitHub Action ou CLI) em pelo menos um ${terms.repository} do produto para comparar com o planejado.`}
          emptyAction={<CollectionGuideLink />}
          onRetry={retryAnalysis}
          headerAction={
            <TextField
              select
              size="small"
              label={terms.Repository}
              value={selectedRepository?.repository_name ?? ''}
              onChange={(event) => setSelectedRepositoryName(event.target.value)}
              sx={{ width: 240 }}
              SelectProps={{ MenuProps: { disableScrollLock: true } }}
            >
              {analysisRepositories.map((repository) => (
                <MenuItem key={repository.repository_name} value={repository.repository_name}>
                  {repository.repository_name}
                </MenuItem>
              ))}
            </TextField>
          }
        >
          <PlannedVsAccomplishedEqualizer
            planned={planned}
            accomplished={selectedRepository?.characteristics}
            normDiff={selectedRepository?.norm_diff}
          />

          <Typography fontWeight="bold" fontSize="15px" color={DASHBOARD_COLORS.cardTitle} marginTop="8px">
            Radar das características
          </Typography>
          {hasAccomplishedValues(selectedRepository) ? (
            <>
              <ReactEcharts
                option={formatRadarOptions(comparisons, selectedRepository?.repository_name ?? '', characteristicName)}
                notMerge
                style={{ height: 300, width: '100%' }}
              />
              <Typography fontSize="12px" color={DASHBOARD_COLORS.mutedText}>
                Mesmos valores do realizado (Rd) do {terms.repository} {selectedRepository?.repository_name} na release{' '}
                {releaseName}.
              </Typography>
            </>
          ) : (
            <MSGAlert severity="warning" title="Ainda não há análises nesta release" action={<CollectionGuideLink />}>
              O {terms.repository} {selectedRepository?.repository_name} ainda não tem características calculadas na
              release {releaseName}. Rode a coleta do MeasureSoftGram (GitHub Action ou CLI) para ver o radar.
            </MSGAlert>
          )}
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
                setSelectedRepositoryName(undefined);
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

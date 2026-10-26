import React, { ReactNode, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Box, Button, Container, Typography } from '@mui/material';

import { NextPageWithLayout } from '@pages/_app.next';
import getLayout from '@components/Layout';
import DashboardCard from '@components/DashboardCard';
import { ExportAllCsvButton } from '@components/ExportCsvButton';
import useRequireAuth from '@hooks/useRequireAuth';
import { usePreloadECharts } from '@components/ECharts';
import { useProviderTerms } from '@hooks/useProviderTerms';
import { DASHBOARD_COLORS } from '@utils/dashboardColors';
import { DISTRIBUTION_LEVEL_LABELS } from '@utils/distributionCascade';
import { formatAnalysisCount, formatPeriod } from '@utils/distributionSummary';
import { DISTRIBUTION_CSV, formatDistributionCsvs } from '@utils/formatDistributionCsv';
import { getPathId } from '@utils/pathDestructer';
import { toLocalDay } from '@utils/releaseSelection';

import DistributionBoxplot, { BOXPLOT_TITLE } from './DistributionBoxplot';
import DistributionDensity, { DENSITY_TITLE } from './DistributionDensity';
import DistributionFilters from './DistributionFilters';
import DistributionHistogram, { HISTOGRAM_TITLE } from './DistributionHistogram';
import DistributionScatter, { SCATTER_TITLE } from './DistributionScatter';
import DistributionSummary, { SUMMARY_TITLE } from './DistributionSummary';
import { ChartSkeleton, CollectionGuideLink, DistributionErrorCard, SummarySkeleton } from './DistributionStates';
import { useDistributionDashboard } from './useDistributionDashboard';

const TITLE = '5. Distribuição Estatística';
const CARD_TITLE = 'Distribuição Estatística';

/** "17/08" de uma data da release, para a orientação do estado sem análise. */
function formatReleaseDay(date: Date | string): string {
  const [, month, day] = toLocalDay(date).split('-');
  return `${day}/${month}`;
}

/**
 * Grade da referência (CA4 a CA8): histograma e densidade lado a lado, boxplot na largura toda, dispersão e resumo
 * lado a lado. Em tela estreita, uma coluna na ordem dos quadros, sem as áreas vazias.
 */
function DistributionGrid({
  histogram,
  density,
  boxplot,
  scatter,
  summary,
  busy
}: {
  histogram: ReactNode;
  density: ReactNode;
  boxplot: ReactNode;
  scatter: ReactNode;
  summary: ReactNode;
  busy?: boolean;
}) {
  return (
    <Box
      data-testid="distribution-grid"
      aria-busy={busy}
      display="grid"
      gap="24px"
      alignItems="start"
      sx={{
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'repeat(2, minmax(0, 1fr))' },
        gridTemplateAreas: { lg: '"hist dens" "box box" "disp summary"' },
        opacity: busy ? 0.6 : 1,
        transition: 'opacity 150ms'
      }}
    >
      <Box sx={{ gridArea: { lg: 'hist' }, minWidth: 0 }}>{histogram}</Box>
      <Box sx={{ gridArea: { lg: 'dens' }, minWidth: 0 }}>{density}</Box>
      <Box sx={{ gridArea: { lg: 'box' }, minWidth: 0 }}>{boxplot}</Box>
      <Box sx={{ gridArea: { lg: 'disp' }, minWidth: 0 }}>{scatter}</Box>
      <Box sx={{ gridArea: { lg: 'summary' }, minWidth: 0 }}>{summary}</Box>
    </Box>
  );
}

const DistributionDashboard: NextPageWithLayout = () => {
  useRequireAuth();
  usePreloadECharts();
  const { terms } = useProviderTerms();
  const router = useRouter();
  const [organizationId, productId] = getPathId(router.query?.product as string);

  const dashboard = useDistributionDashboard(organizationId, productId);
  const { release, level, selectedEntity, distribution, entity, children, period, status, isUpdating, retry } =
    dashboard;

  const entityName = level === 'tsqmi' ? DISTRIBUTION_LEVEL_LABELS.tsqmi : selectedEntity?.name;
  // os CSVs levam o que os quadros mostram: enquanto a seleção nova carrega, a resposta anterior, como eles
  const csv = useMemo(
    () => (status === 'ready' && distribution ? formatDistributionCsvs(distribution) : undefined),
    [status, distribution]
  );
  const csvCharts = csv ? [csv.histogram, csv.density, csv.boxplot, csv.scatter, csv.summary] : [];

  const renderContent = () => {
    if (status === 'error') return <DistributionErrorCard onRetry={retry} />;

    if (status === 'noRelease') {
      return (
        <DashboardCard
          title="Produto sem release"
          status="empty"
          badgeLabel="Sem release"
          emptyTitle="Este produto ainda não tem release"
          emptyDescription="A distribuição usa as análises feitas dentro do período de uma release. Planeje a primeira release para começar."
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

    if (status === 'noRepository') {
      return (
        <DashboardCard
          title={CARD_TITLE}
          status="empty"
          emptyTitle={`Este produto ainda não tem ${terms.repositories}`}
          emptyDescription={`Adicione um ${terms.repository} ao produto e rode a coleta do MeasureSoftGram para ver a distribuição dos valores.`}
        />
      );
    }

    if (status === 'noEntities') {
      const label = DISTRIBUTION_LEVEL_LABELS[level].toLowerCase();
      return (
        <DashboardCard
          title={CARD_TITLE}
          status="empty"
          emptyTitle={
            level === 'metric'
              ? `Nenhuma métrica da release ${release?.release_name} tem um valor por análise`
              : `A configuração da release ${release?.release_name} não tem nenhuma entidade no nível ${label}`
          }
          emptyDescription={
            level === 'metric'
              ? 'Só entram as métricas gravadas a cada análise, como as do GitHub. As do SonarQube são coletadas por arquivo.'
              : 'Escolha outro nível ou confira a configuração do modelo da release.'
          }
        />
      );
    }

    if (status === 'noAnalyses' && distribution) {
      const { release: analyzed, repository: analyzedRepository, entity: emptyEntity } = distribution;
      return (
        <DashboardCard
          title={CARD_TITLE}
          status="empty"
          badgeLabel="Sem análise"
          emptyTitle={`O ${terms.repository} ${analyzedRepository.name} não tem análises de ${emptyEntity.name} na release ${analyzed.release_name}`}
          emptyDescription={`As análises aparecem quando a Action ou a CLI do MeasureSoftGram roda no ${
            terms.repository
          } entre ${formatReleaseDay(analyzed.start_at)} e ${formatReleaseDay(
            analyzed.end_at
          )}, o período da release. Escolha outro ${terms.repository} ou configure a coleta.`}
          emptyAction={<CollectionGuideLink />}
        />
      );
    }

    if (status === 'ready' && entity) {
      return (
        <DistributionGrid
          busy={isUpdating}
          histogram={<DistributionHistogram entity={entity} csv={csv?.histogram} />}
          density={<DistributionDensity entity={entity} csv={csv?.density} />}
          boxplot={<DistributionBoxplot entity={entity} childEntities={children ?? []} csv={csv?.boxplot} />}
          scatter={<DistributionScatter entity={entity} csv={csv?.scatter} />}
          summary={<DistributionSummary summary={entity.summary} csv={csv?.summary} />}
        />
      );
    }

    return (
      <DistributionGrid
        histogram={<DashboardCard title={HISTOGRAM_TITLE} status="loading" loadingContent={<ChartSkeleton />} />}
        density={<DashboardCard title={DENSITY_TITLE} status="loading" loadingContent={<ChartSkeleton />} />}
        boxplot={<DashboardCard title={BOXPLOT_TITLE} status="loading" loadingContent={<ChartSkeleton />} />}
        scatter={<DashboardCard title={SCATTER_TITLE} status="loading" loadingContent={<ChartSkeleton />} />}
        summary={<DashboardCard title={SUMMARY_TITLE} status="loading" loadingContent={<SummarySkeleton />} />}
      />
    );
  };

  return (
    <>
      <Head>
        <title>{TITLE}</title>
      </Head>

      <Container maxWidth="xl">
        <Box display="flex" flexDirection="column" gap="24px" marginTop="40px" marginBottom="40px">
          {/* em tela estreita, o botão de exportar desce para baixo do título em vez de alargar a página */}
          <Box display="flex" alignItems="flex-start" justifyContent="space-between" flexWrap="wrap" gap="16px">
            <Box>
              <Typography component="h1" fontWeight="bold" fontSize="30px" color={DASHBOARD_COLORS.primary}>
                {TITLE}
              </Typography>
              <Typography color={DASHBOARD_COLORS.mutedText} data-testid="distribution-subtitle">
                Como os valores de <em>{entityName ?? 'uma entidade do modelo'}</em> se espalham entre as suas análises
              </Typography>
            </Box>
            <ExportAllCsvButton dashboard={DISTRIBUTION_CSV.dashboard} charts={csvCharts} />
          </Box>

          <DistributionFilters {...dashboard} />

          {status === 'ready' && distribution && period?.first && period.last && (
            <Typography fontSize="14px" color={DASHBOARD_COLORS.text} data-testid="distribution-period">
              Release <strong>{distribution.release.release_name}</strong> · {terms.repository}{' '}
              <strong>{distribution.repository.name}</strong> · {formatAnalysisCount(period.count)} no período (
              {formatPeriod(period.first, period.last)})
            </Typography>
          )}

          {renderContent()}
        </Box>
      </Container>
    </>
  );
};

DistributionDashboard.getLayout = getLayout;

export default DistributionDashboard;

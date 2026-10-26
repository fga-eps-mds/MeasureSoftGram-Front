import React, { useCallback, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Box, Button, Container, Tab, Tabs, Typography } from '@mui/material';

import { NextPageWithLayout } from '@pages/_app.next';
import getLayout from '@components/Layout';
import DashboardCard, { SkeletonBlock } from '@components/DashboardCard';
import ExportCsvButton, { ExportAllCsvButton } from '@components/ExportCsvButton';
import ReleaseSelect from '@components/ReleaseSelect';
import useRequireAuth from '@hooks/useRequireAuth';
import { useProviderTerms } from '@hooks/useProviderTerms';
import { EntityMatrix, EntityMatrixLevel } from '@customTypes/product';
import { DASHBOARD_COLORS } from '@utils/dashboardColors';
import { LEVEL_LABELS } from '@utils/entityLevels';
import {
  ENTITY_CSV,
  formatEntityContributionCsv,
  formatEntityHeatmapCsv,
  formatEntityRankingCsv,
  formatScore,
  getContributions,
  getHighlightedCells,
  getPairs,
  getReading,
  getWorstPairs,
  hasAnyValue,
  LEVEL_PATHS,
  MATRIX_LEVELS
} from '@utils/entityMatrix';
import { getPathId } from '@utils/pathDestructer';
import { toLocalDay } from '@utils/releaseSelection';
import { useEntityAnalysis } from './useEntityAnalysis';
import EntityHeatmap, { QualityGradeLegend, SelectedCell } from './EntityHeatmap';
import ContributionChart from './ContributionChart';
import WorstPairsRanking from './WorstPairsRanking';
import RepositoryDetailDialog from './RepositoryDetailDialog';

const TITLE = '4. Análise por Entidade';
const CARD_TITLE = 'Análise por Entidade';
export const CONTRIBUTION_TITLE = 'O que puxa a qualidade total para baixo';
export const RANKING_TITLE = 'Ranking dos piores pares';

const levelNoun = (level: EntityMatrixLevel) => LEVEL_LABELS[level].toLowerCase();

/** "17/08" de uma data da release, para a orientação do estado sem análise. */
function formatReleaseDay(date: Date | string): string {
  const [, month, day] = toLocalDay(date).split('-');
  return `${day}/${month}`;
}

function HeatmapSkeleton() {
  return (
    <Box display="flex" flexDirection="column" gap="6px">
      {Array.from({ length: 5 }, (_, index) => (
        <SkeletonBlock key={index} width="100%" height={40} />
      ))}
    </Box>
  );
}

/** Frase de leitura do mapa (CA4). */
function Reading({ matrix }: { matrix: EntityMatrix }) {
  const reading = getReading(matrix);
  if (!reading) return null;
  const noun = levelNoun(matrix.level);
  const { weakest, widest } = reading;

  return (
    <Box
      data-testid="entity-reading"
      sx={{ backgroundColor: '#F3F4F6', borderRadius: '6px', padding: '10px 14px', fontSize: '14px' }}
    >
      <Typography component="p" fontSize="14px" color={DASHBOARD_COLORS.text}>
        <strong>Leitura:</strong> {weakest.column.name} é a {noun} mais fraca do produto (média{' '}
        {formatScore(weakest.mean)}).
        {widest && (
          <>
            {' '}
            {widest.column.name} tem a maior dispersão entre os repositórios: de {formatScore(widest.lowest.value)} (
            {widest.lowest.repository}) a {formatScore(widest.highest.value)} ({widest.highest.repository}).
          </>
        )}
      </Typography>
    </Box>
  );
}

const EntityAnalysisDashboard: NextPageWithLayout = () => {
  useRequireAuth();
  const { terms } = useProviderTerms();
  const router = useRouter();
  const [organizationId, productId] = getPathId(router.query?.product as string);

  const {
    releases,
    releaseId,
    currentReleaseId,
    setReleaseId,
    level,
    setLevel,
    matrix,
    isLoadingReleases,
    isLoading,
    error,
    retry
  } = useEntityAnalysis(organizationId, productId);

  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const closeDetail = useCallback(() => setSelectedCell(null), []);

  const pairs = useMemo(() => (matrix ? getPairs(matrix) : []), [matrix]);
  const highlighted = useMemo(() => getHighlightedCells(pairs), [pairs]);
  const contributions = useMemo(() => getContributions(pairs), [pairs]);
  const worstPairs = useMemo(() => getWorstPairs(pairs), [pairs]);

  // os CSVs só existem com o mapa na tela: sem análise, sem entidades ou sem repositórios o .zip fica desabilitado
  const readyMatrix =
    !error && !isLoading && matrix && matrix.columns.length > 0 && matrix.repositories.length > 0 && hasAnyValue(matrix)
      ? matrix
      : undefined;
  const csvCharts = useMemo(
    () =>
      readyMatrix
        ? {
            heatmap: formatEntityHeatmapCsv(readyMatrix),
            contribution: formatEntityContributionCsv(readyMatrix, contributions),
            ranking: formatEntityRankingCsv(readyMatrix, worstPairs)
          }
        : undefined,
    [readyMatrix, contributions, worstPairs]
  );

  const heatmapTitle = `Mapa de calor: repositório × ${levelNoun(level)}`;

  const renderContribution = (data: EntityMatrix) => {
    if (!data.previous_release) {
      return (
        <DashboardCard
          title={CONTRIBUTION_TITLE}
          status="empty"
          badgeLabel="Primeira release"
          emptyTitle={`${data.release.release_name} é a primeira release do produto`}
          emptyDescription="Não há release anterior para comparar. A contribuição de cada par aparece a partir da próxima release."
        />
      );
    }
    if (contributions.length === 0) {
      return (
        <DashboardCard
          title={CONTRIBUTION_TITLE}
          status="empty"
          emptyTitle={`Nenhum par mudou o TSQMI de ${data.previous_release.release_name} para ${data.release.release_name}`}
          emptyDescription={`A contribuição só aparece quando a entidade tem valor nas duas releases no mesmo ${terms.repository}.`}
        />
      );
    }
    return (
      <DashboardCard
        title={CONTRIBUTION_TITLE}
        status="ready"
        headerAction={csvCharts && <ExportCsvButton dashboard={ENTITY_CSV.dashboard} chart={csvCharts.contribution} />}
      >
        <Typography fontSize="13px" color={DASHBOARD_COLORS.mutedText}>
          Quanto cada par {terms.repository} × {levelNoun(data.level)} fez o TSQMI do {terms.repository} subir ou descer
          de {data.previous_release.release_name} para {data.release.release_name}: o TSQMI recalculado com o valor da
          release anterior, pelos pesos do modelo. Os {contributions.length} pares que mais mudaram o indicador.
        </Typography>
        <ContributionChart pairs={contributions} />
      </DashboardCard>
    );
  };

  const renderContent = () => {
    if (error) {
      return (
        <DashboardCard
          title={CARD_TITLE}
          status="error"
          errorTitle="Não foi possível carregar a análise por entidade"
          onRetry={retry}
        />
      );
    }

    if (!isLoadingReleases && releases.length === 0) {
      return (
        <DashboardCard
          title="Produto sem release"
          status="empty"
          badgeLabel="Sem release"
          emptyTitle="Este produto ainda não tem release"
          emptyDescription={`A análise compara os ${terms.repositories} dentro do período de uma release. Planeje a primeira release para começar.`}
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

    if (isLoading || !matrix) {
      return <DashboardCard title={heatmapTitle} status="loading" loadingContent={<HeatmapSkeleton />} />;
    }

    if (matrix.columns.length === 0) {
      return (
        <DashboardCard
          title={heatmapTitle}
          status="empty"
          emptyTitle={`A configuração da release ${
            matrix.release.release_name
          } não tem nenhuma entidade no nível ${levelNoun(matrix.level)}`}
          emptyDescription="Escolha outro nível ou confira a configuração do modelo da release."
        />
      );
    }

    if (matrix.repositories.length === 0) {
      return (
        <DashboardCard
          title={heatmapTitle}
          status="empty"
          emptyTitle={`Este produto ainda não tem ${terms.repositories}`}
          emptyDescription={`Adicione um ${terms.repository} ao produto e rode a coleta do MeasureSoftGram para comparar os valores.`}
        />
      );
    }

    if (!hasAnyValue(matrix)) {
      return (
        <DashboardCard
          title={heatmapTitle}
          status="empty"
          badgeLabel="Sem análise"
          emptyTitle={`A release ${matrix.release.release_name} ainda não tem análises`}
          emptyDescription={`Os valores aparecem quando a Action ou a CLI do MeasureSoftGram roda nos ${
            terms.repositories
          } entre ${formatReleaseDay(matrix.release.start_at)} e ${formatReleaseDay(
            matrix.release.end_at
          )}, o período da release.`}
        />
      );
    }

    const deltaCaption = matrix.previous_release
      ? ` Δ é a variação em relação à release anterior, ${matrix.previous_release.release_name}.`
      : ` ${matrix.release.release_name} é a primeira release do produto: sem variação para mostrar.`;

    return (
      <>
        <DashboardCard
          title={heatmapTitle}
          status="ready"
          headerAction={csvCharts && <ExportCsvButton dashboard={ENTITY_CSV.dashboard} chart={csvCharts.heatmap} />}
        >
          <Typography fontSize="13px" color={DASHBOARD_COLORS.mutedText}>
            Linhas do pior para o melhor TSQMI. Cada célula mostra o valor normalizado [0, 1] e o grau; clique numa
            célula para ver a composição da entidade naquele {terms.repository}.{deltaCaption}
          </Typography>
          <EntityHeatmap matrix={matrix} highlighted={highlighted} onSelectCell={setSelectedCell} />
          <QualityGradeLegend />
          <Reading matrix={matrix} />
        </DashboardCard>

        <Box
          display="grid"
          gap="24px"
          alignItems="start"
          sx={{ gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'repeat(2, minmax(0, 1fr))' } }}
        >
          {renderContribution(matrix)}
          <DashboardCard
            title={RANKING_TITLE}
            status="ready"
            headerAction={
              <Box display="flex" flexWrap="wrap" alignItems="center" gap="8px">
                <Box sx={{ backgroundColor: DASHBOARD_COLORS.text, borderRadius: '12px', padding: '4px 10px' }}>
                  <Typography fontWeight="bold" fontSize="12px" color="#FFFFFF">
                    Nível: {LEVEL_LABELS[matrix.level]}
                  </Typography>
                </Box>
                {csvCharts && <ExportCsvButton dashboard={ENTITY_CSV.dashboard} chart={csvCharts.ranking} />}
              </Box>
            }
          >
            <Typography fontSize="13px" color={DASHBOARD_COLORS.mutedText}>
              {terms.repository} × {levelNoun(matrix.level)}, do menor valor para o maior.{deltaCaption}
            </Typography>
            <WorstPairsRanking pairs={worstPairs} />
          </DashboardCard>
        </Box>

        <RepositoryDetailDialog
          organizationId={organizationId}
          productId={productId}
          releaseId={releaseId}
          level={matrix.level}
          cell={selectedCell}
          onClose={closeDetail}
        />
      </>
    );
  };

  return (
    <>
      <Head>
        <title>{TITLE}</title>
      </Head>

      <Container maxWidth="xl">
        <Box display="flex" flexDirection="column" gap="24px" marginTop="40px" marginBottom="40px">
          <Box display="flex" flexWrap="wrap" alignItems="flex-start" gap="16px">
            <Box flex={1} minWidth="260px">
              <Typography component="h1" fontWeight="bold" fontSize="30px" color={DASHBOARD_COLORS.primary}>
                {TITLE}
              </Typography>
              <Typography color={DASHBOARD_COLORS.mutedText}>
                Em qual entidade e em qual nível do modelo a qualidade está caindo
              </Typography>
            </Box>
            {releases.length > 0 && (
              <ReleaseSelect
                releases={releases}
                value={releaseId}
                currentReleaseId={currentReleaseId}
                onChange={setReleaseId}
                disabled={isLoadingReleases}
              />
            )}
            <ExportAllCsvButton
              dashboard={ENTITY_CSV.dashboard}
              charts={csvCharts ? [csvCharts.heatmap, csvCharts.contribution, csvCharts.ranking] : []}
            />
          </Box>

          {releases.length > 0 && (
            <Box display="flex" flexWrap="wrap" alignItems="center" justifyContent="space-between" gap="12px">
              <Box display="flex" flexWrap="wrap" alignItems="center" gap="12px" minWidth={0} maxWidth="100%">
                <Typography id="entity-level-label" fontSize="14px" fontWeight="bold" color={DASHBOARD_COLORS.text}>
                  Nível do modelo
                </Typography>
                <Tabs
                  value={level}
                  onChange={(_, value: EntityMatrixLevel) => setLevel(value)}
                  aria-labelledby="entity-level-label"
                  // em tela estreita as abas rolam dentro delas, sem alargar a página
                  variant="scrollable"
                  scrollButtons={false}
                  sx={{
                    minHeight: 36,
                    maxWidth: '100%',
                    '& .MuiTab-root': { minHeight: 36, textTransform: 'none', fontWeight: 'bold' }
                  }}
                >
                  {MATRIX_LEVELS.map((item) => (
                    <Tab key={item} value={item} label={LEVEL_LABELS[item]} />
                  ))}
                </Tabs>
              </Box>
              <Typography fontSize="14px" color={DASHBOARD_COLORS.mutedText} data-testid="entity-level-path">
                {LEVEL_PATHS[level].map((step, index, steps) => (
                  <React.Fragment key={step}>
                    {index > 0 && ' › '}
                    {index === steps.length - 1 ? <strong>{step}</strong> : step}
                  </React.Fragment>
                ))}
              </Typography>
            </Box>
          )}

          {renderContent()}
        </Box>
      </Container>
    </>
  );
};

EntityAnalysisDashboard.getLayout = getLayout;

export default EntityAnalysisDashboard;

import React, { useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Box, Container, SxProps, Theme, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';

import { NextPageWithLayout } from '@pages/_app.next';
import getLayout from '@components/Layout';
import DashboardCard, { SkeletonBlock } from '@components/DashboardCard';
import ReactEcharts, { usePreloadECharts } from '@components/ECharts';
import useRequireAuth from '@hooks/useRequireAuth';
import { useProviderTerms } from '@hooks/useProviderTerms';
import { DASHBOARD_COLORS } from '@utils/dashboardColors';
import { formatTimeEvolutionOptions } from '@utils/formatTimeEvolutionChart';
import { TimeGranularity } from '@utils/historicalValues';
import { getPathId } from '@utils/pathDestructer';

import { MultiSelectFilter, SingleSelectFilter } from './TemporalFilters';
import { EvolutionChartData, EvolutionLevel, useTemporalEvolution } from './useTemporalEvolution';

const TITLE = '2. Evolução Temporal';
const CHART_HEIGHT = 300;
const TOGGLE_SX: SxProps<Theme> = {
  textTransform: 'none',
  fontWeight: 'bold',
  paddingX: '16px',
  color: DASHBOARD_COLORS.text,
  '&.Mui-selected, &.Mui-selected:hover': { backgroundColor: DASHBOARD_COLORS.primary, color: '#FFFFFF' }
};

const CHARTS: { level: EvolutionLevel; title: string; label: string; normalized: boolean }[] = [
  { level: 'characteristics', title: 'Característica', label: 'característica', normalized: true },
  { level: 'subcharacteristics', title: 'Subcaracterísticas', label: 'subcaracterísticas', normalized: true },
  { level: 'measures', title: 'Medidas', label: 'medidas', normalized: true },
  { level: 'metrics', title: 'Métricas', label: 'métricas', normalized: false }
];

interface EvolutionChartCardProps {
  chart: (typeof CHARTS)[number];
  data: EvolutionChartData;
  granularity: TimeGranularity;
  emptyTitle: string;
  emptyDescription: string;
}

function EvolutionChartCard({ chart, data, granularity, emptyTitle, emptyDescription }: EvolutionChartCardProps) {
  const options = useMemo(
    () => formatTimeEvolutionOptions(data.series, granularity, chart.normalized),
    [data.series, granularity, chart.normalized]
  );

  let status: 'loading' | 'error' | 'empty' | 'ready' = 'ready';
  if (data.hasError) status = 'error';
  else if (data.isLoading) status = 'loading';
  else if (data.series.length === 0) status = 'empty';

  return (
    <DashboardCard
      title={chart.title}
      status={status}
      loadingContent={<SkeletonBlock width="100%" height={CHART_HEIGHT} />}
      loadingMessage={`Carregando a evolução das ${chart.label}…`}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      errorTitle={`Não foi possível carregar a evolução das ${chart.label}`}
      onRetry={data.retry}
    >
      <ReactEcharts option={options} notMerge style={{ height: CHART_HEIGHT, width: '100%' }} />
    </DashboardCard>
  );
}

const TemporalDashboard: NextPageWithLayout = () => {
  const { terms } = useProviderTerms();
  useRequireAuth();
  usePreloadECharts();

  const { query } = useRouter();
  const [organizationId, productId] = getPathId(query?.product as string);
  const evolution = useTemporalEvolution(organizationId, productId);
  const { repositories, isLoadingRepositories, granularity, measures } = evolution;

  const emptyMessages: Record<EvolutionLevel, { title: string; description: string }> = {
    characteristics: {
      title: `Ainda não há valores desta característica neste ${terms.repository}`,
      description: `Os valores aparecem depois que a Action do MeasureSoftGram analisa o ${terms.repository}.`
    },
    subcharacteristics: {
      title: `Ainda não há valores das subcaracterísticas escolhidas neste ${terms.repository}`,
      description: `Os valores aparecem depois que a Action do MeasureSoftGram analisa o ${terms.repository}.`
    },
    measures: {
      title: `Ainda não há valores das medidas escolhidas neste ${terms.repository}`,
      description: `Os valores aparecem depois que a Action do MeasureSoftGram analisa o ${terms.repository}.`
    },
    metrics: {
      title: `${measures === 'all' ? 'As medidas' : 'As medidas escolhidas'} não têm métricas do ${
        terms.repository
      } inteiro`,
      description: 'As métricas coletadas por arquivo estão no dashboard 5. Distribuição das Métricas.'
    }
  };

  const renderContent = () => {
    if (!isLoadingRepositories && repositories.length === 0) {
      return (
        <DashboardCard
          title="Evolução Temporal"
          status="empty"
          emptyTitle={`Este produto ainda não tem ${terms.repositories}`}
          emptyDescription={`Adicione um ${terms.repository} para acompanhar a evolução da qualidade.`}
        />
      );
    }
    return CHARTS.map((chart) => (
      <EvolutionChartCard
        key={chart.level}
        chart={chart}
        data={evolution.charts[chart.level]}
        granularity={granularity}
        emptyTitle={emptyMessages[chart.level].title}
        emptyDescription={emptyMessages[chart.level].description}
      />
    ));
  };

  return (
    <>
      <Head>
        <title>{TITLE}</title>
      </Head>

      <Container maxWidth="xl">
        <Box display="flex" flexDirection="column" gap="28px" marginTop="40px" marginBottom="40px">
          <Box>
            <Typography component="h1" fontWeight="bold" fontSize="30px" color={DASHBOARD_COLORS.primary}>
              {TITLE}
            </Typography>
            <Typography fontSize="13px" color={DASHBOARD_COLORS.mutedText}>
              Cada nível mostra as filhas do que foi escolhido no nível anterior. Com mais de uma análise no mesmo dia
              ou mês, vale a última.
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" flexWrap="wrap" gap="16px">
            <SingleSelectFilter
              label={terms.Repository}
              value={evolution.repositoryId}
              options={repositories.map((repository) => ({ key: repository.id, name: repository.name }))}
              onChange={(value) => evolution.setRepositoryId(Number(value))}
            />
            <SingleSelectFilter
              label="Característica"
              value={evolution.characteristic}
              options={evolution.characteristicOptions}
              onChange={evolution.setCharacteristic}
            />
            <MultiSelectFilter
              label="Subcaracterística"
              value={evolution.subcharacteristics}
              options={evolution.subcharacteristicOptions}
              onChange={evolution.setSubcharacteristics}
            />
            <MultiSelectFilter
              label="Medida"
              value={evolution.measures}
              options={evolution.measureOptions}
              onChange={evolution.setMeasures}
            />
            <MultiSelectFilter
              label="Métrica"
              value={evolution.metrics}
              options={evolution.metricOptions}
              onChange={evolution.setMetrics}
            />

            <ToggleButtonGroup
              exclusive
              size="small"
              value={granularity}
              onChange={(_event, value: TimeGranularity | null) => {
                if (value) evolution.setGranularity(value);
              }}
              aria-label="Eixo do tempo"
              sx={{ marginLeft: { md: 'auto' }, backgroundColor: '#FFFFFF' }}
            >
              <ToggleButton value="day" sx={TOGGLE_SX}>
                Dias
              </ToggleButton>
              <ToggleButton value="month" sx={TOGGLE_SX}>
                Meses
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {renderContent()}
        </Box>
      </Container>
    </>
  );
};

TemporalDashboard.getLayout = getLayout;

export default TemporalDashboard;

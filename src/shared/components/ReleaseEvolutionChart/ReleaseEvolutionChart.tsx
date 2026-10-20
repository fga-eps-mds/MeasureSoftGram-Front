import React, { useMemo } from 'react';
import ReactEcharts from '@components/ECharts';
import { Alert, Box, Button, CircularProgress, Paper, Typography } from '@mui/material';
import { COLOR_TOKENS } from '@utils/formatPulseChart';
import { ReleaseSeries } from '@utils/groupHistoryByRelease';

/** Paleta das telas atuais: primária, planejado × realizado e faixas de qualidade. */
export const SERIES_COLORS = [
  COLOR_TOKENS.primary,
  '#FF8C00',
  COLOR_TOKENS.adequate,
  '#1F60C4',
  COLOR_TOKENS.warning,
  COLOR_TOKENS.secondary,
  COLOR_TOKENS.critical,
  '#7B5EA7',
  '#2E9C9C',
  COLOR_TOKENS.axisText,
];

export interface ReleaseEvolutionChartProps {
  title: string;
  releaseNames: string[];
  series: ReleaseSeries[];
  isLoading?: boolean;
  hasError?: boolean;
  onRetry?: () => void;
  emptyMessage: string;
  /** Características, subcaracterísticas e medidas vão de 0 a 1; métricas usam o valor coletado. */
  normalized?: boolean;
  height?: number;
}

export function formatReleaseEvolutionOptions(releaseNames: string[], series: ReleaseSeries[], normalized: boolean) {
  return {
    color: SERIES_COLORS,
    animation: false,
    grid: { left: 16, right: 24, top: 48, bottom: 16, containLabel: true },
    legend: { type: 'scroll', top: 0, textStyle: { color: COLOR_TOKENS.mutedText } },
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value: number | null) =>
        value === null || value === undefined ? 'sem dado' : Number(value).toFixed(2),
    },
    xAxis: {
      type: 'category',
      data: releaseNames,
      boundaryGap: false,
      axisLabel: { color: COLOR_TOKENS.axisText },
      axisLine: { lineStyle: { color: COLOR_TOKENS.border } },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: normalized ? 1 : undefined,
      axisLabel: { color: COLOR_TOKENS.axisText },
      splitLine: { lineStyle: { color: COLOR_TOKENS.gridLine } },
    },
    series: series.map((item) => ({
      name: item.name,
      type: 'line',
      data: item.values,
      // release sem análise fica como buraco na linha, e não como zero
      connectNulls: false,
      symbol: 'circle',
      symbolSize: 7,
    })),
  };
}

export default function ReleaseEvolutionChart({
  title,
  releaseNames,
  series,
  isLoading = false,
  hasError = false,
  onRetry,
  emptyMessage,
  normalized = true,
  height = 320,
}: ReleaseEvolutionChartProps) {
  const options = useMemo(
    () => formatReleaseEvolutionOptions(releaseNames, series, normalized),
    [releaseNames, series, normalized]
  );

  const renderContent = () => {
    if (hasError) {
      return (
        <Alert
          severity="error"
          action={
            onRetry && (
              <Button color="inherit" size="small" onClick={onRetry}>
                Tentar novamente
              </Button>
            )
          }
        >
          Não foi possível carregar este gráfico.
        </Alert>
      );
    }
    if (isLoading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height={height}>
          <CircularProgress size={32} />
        </Box>
      );
    }
    if (series.length === 0 || releaseNames.length === 0) {
      return <Alert severity="info">{emptyMessage}</Alert>;
    }
    return <ReactEcharts option={options} notMerge style={{ height, width: '100%' }} />;
  };

  return (
    <Paper
      elevation={0}
      data-testid={`release-evolution-${title}`}
      sx={{ border: '1px solid #d0d7de', borderRadius: '8px', padding: 2, display: 'flex', flexDirection: 'column', gap: 1 }}
    >
      <Typography variant="h6" color={COLOR_TOKENS.primary} fontWeight={500}>
        {title}
      </Typography>
      {renderContent()}
    </Paper>
  );
}

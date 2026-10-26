import React, { useRef } from 'react';
import ReactEcharts from '@components/ECharts';
import { Box, Paper, Typography, CircularProgress, Alert } from '@mui/material';
import ExportCsvButton from '@components/ExportCsvButton';
import { PULSE_GRID, PulseMeasurement, PulseRelease, formatPulseChartOptions } from '@utils/formatPulseChart';
import { PULSE_CSV, formatProductPulseCsv } from '@utils/formatPulseCsv';
import { formatPulseReleaseTooltip } from '@utils/formatPulseReleaseTooltip';
import { usePulseChartData } from './usePulseChartData';
import { PulseChartFilters } from './PulseChartFilters';
import { PulseChartRepoSidebar } from './PulseChartRepoSidebar';
import { QualityLegend } from './QualityLegend';
import { useProviderTerms } from '@hooks/useProviderTerms';

// Protótipo aprovado pelo PO (US06.01): sem linhas horizontais, a etiqueta da release em cada faixa (sem a de início)
// e os detalhes da release no ponto do indicador.
const PULSE_OPTIONS = {
  releaseLabels: 'every-row',
  releaseStartLabels: false,
  horizontalLines: false,
  releaseTooltip: formatPulseReleaseTooltip,
} as const;

/**
 * Base da variação na barra lateral: a release com indicador encerrada mais recentemente antes da última medição.
 * Uma release cuja janela inclui a última medição tem como indicador essa mesma medição, e a variação daria sempre 0.
 */
export function getReferenceRelease(releases: PulseRelease[], measurements: PulseMeasurement[]) {
  const latestMs = Math.max(...measurements.map((m) => new Date(m.created_at).getTime()));
  const release = releases
    .filter((rel) => typeof rel.tsqmi?.value === 'number' && new Date(rel.end_at).getTime() < latestMs)
    .sort((a, b) => new Date(a.end_at).getTime() - new Date(b.end_at).getTime())
    .pop();
  return release ? { name: release.name, value: release.tsqmi?.value as number } : undefined;
}

interface Props {
  organizationId?: string;
  productId?: string;
}

export const PulseChart: React.FC<Props> = ({ organizationId, productId }) => {
  const { terms } = useProviderTerms();
  const echartsRef = useRef<any>(null);

  const {
    allRepositories,
    filteredRepositories,
    selectedRepo,
    setSelectedRepo,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedMeasurements,
    latestDate,
    releasesInPeriod,
    isLoading,
    error,
  } = usePulseChartData(organizationId, productId);

  const chartOptions = formatPulseChartOptions(filteredRepositories, PULSE_OPTIONS);


  if (isLoading) {
    return (
      <Paper elevation={0} sx={{ padding: '24px', borderRadius: '12px', border: '1px solid #E0E0E0' }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper elevation={0} sx={{ padding: '24px', borderRadius: '12px', border: '1px solid #E0E0E0' }}>
        <Alert severity="error">Não foi possível carregar os dados do gráfico de pulso.</Alert>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #E0E0E0',
        backgroundColor: '#FFFFFF',
      }}
    >
      {/* Filters Bar */}
      <PulseChartFilters
        repositories={allRepositories}
        selectedRepo={selectedRepo}
        onRepoChange={setSelectedRepo}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        exportAction={<ExportCsvButton dashboard={PULSE_CSV.product} chart={formatProductPulseCsv(filteredRepositories)} />}
      />

      {/* Card do gráfico: título, subtítulo e legenda logo abaixo, à esquerda (protótipo) */}
      <Box sx={{ border: '1px solid #E0E0E0', borderRadius: '8px', padding: '24px' }}>
        <Box display="flex" flexDirection="column" gap="4px" marginBottom="16px">
          <Typography variant="h6" fontWeight="bold" color="#1F2937">
            Gráfico MSG — Evolução de Qualidade por Release
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
            Gráfico de pulso por {terms.repository} (indicador TSQMI) • pico = variação entre medições • marcador = Release
            • ponto = indicador consolidado no encerramento da Release • cor = faixa de qualidade
          </Typography>
          <QualityLegend />
        </Box>

        {/* Main ECharts + Sidebar Area */}
        {filteredRepositories.length === 0 ? (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            minHeight="200px"
            sx={{ border: '1px dashed #D0D7DE', borderRadius: '8px' }}
          >
            <Typography color="text.secondary" variant="body2">
              Nenhuma medição no período selecionado. Ajuste as datas De/Até.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ position: 'relative', width: '100%' }}>
            {/* Left repo overlays */}
            {filteredRepositories.map((repo, index) => (
              <PulseChartRepoSidebar
                key={repo.id}
                name={repo.name}
                measurements={repo.measurements}
                topOffset={PULSE_GRID.topOffset + index * (PULSE_GRID.height + PULSE_GRID.gap)}
                valueLabel="último indicador TSQMI"
                showIcon={false}
                reference={getReferenceRelease(repo.releases, repo.measurements)}
              />
            ))}

            {/* Apache ECharts dynamic component */}
            {/* notMerge: a cada filtro, o gráfico é refeito; mesclando, ficariam as faixas e séries anteriores */}
            <ReactEcharts
              ref={echartsRef}
              option={chartOptions}
              notMerge
              style={{
                height: `${chartOptions.height || 400}px`,
                width: '100%',
              }}
            />
          </Box>
        )}
      </Box>

      {/* Footer summary */}
      <Box marginTop="16px">
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px' }}>
          {filteredRepositories.length} {terms.repository}
          {filteredRepositories.length === 1 ? '' : 's'} • {selectedMeasurements}{' '}
          {selectedMeasurements === 1 ? 'medição' : 'medições'} no período selecionado • {releasesInPeriod}{' '}
          {releasesInPeriod === 1 ? 'Release' : 'Releases'} no período • última medição: {latestDate || 'N/A'}
        </Typography>
      </Box>
    </Paper>
  );
};

export default PulseChart;

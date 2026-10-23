import React, { useRef } from 'react';
import ReactEcharts from '@components/ECharts';
import { Box, Paper, Typography, CircularProgress, Alert } from '@mui/material';
import { PULSE_GRID, formatPulseChartOptions, convertPulseRepositoriesToCsv } from '@utils/formatPulseChart';
import { usePulseChartData } from './usePulseChartData';
import { PulseChartFilters } from './PulseChartFilters';
import { PulseChartRepoSidebar } from './PulseChartRepoSidebar';
import { QualityLegend } from './QualityLegend';
import { useProviderTerms } from '@hooks/useProviderTerms';

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
    totalMeasurements,
    selectedMeasurements,
    latestDate,
    isLoading,
    error,
  } = usePulseChartData(organizationId, productId);

  const chartOptions = formatPulseChartOptions(filteredRepositories);

  const handleExportCsv = () => {
    if (!filteredRepositories.length) return;
    const csvContent = convertPulseRepositoriesToCsv(filteredRepositories);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const timestamp = new Date().toISOString().split('T')[0];
    a.download = `msgram-evolucao-qualidade-${timestamp}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };


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
        onExportCsv={handleExportCsv}
      />

      {/* Header section */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" marginBottom="16px">
        <Box>
          <Typography variant="h6" fontWeight="bold" color="#1F2937">
            Gráfico MSG — Evolução de Qualidade
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
            Gráfico de pulso por {terms.repository} (TSQMI) • pico = variação entre medições • marcadores = releases planejadas • cor = faixa de qualidade
          </Typography>
        </Box>

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
            />
          ))}

          {/* Apache ECharts dynamic component */}
          <ReactEcharts
            ref={echartsRef}
            option={chartOptions}
            style={{
              height: `${chartOptions.height || 400}px`,
              width: '100%',
            }}
          />
        </Box>
      )}

      {/* Footer summary */}
      <Box display="flex" justifyContent="space-between" alignItems="center" marginTop="16px">
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px' }}>
          {filteredRepositories.length} {terms.repository}(s) • {totalMeasurements} medição(ões) total(is) • {selectedMeasurements} no período • Última medição: {latestDate || 'N/A'}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px' }}>
          Renderizado com Apache ECharts
        </Typography>
      </Box>
    </Paper>
  );
};

export default PulseChart;

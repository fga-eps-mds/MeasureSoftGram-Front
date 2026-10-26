import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import DashboardCard, { SkeletonBlock } from '@components/DashboardCard';
import ReactEcharts from '@components/ECharts';
import ExportCsvButton from '@components/ExportCsvButton';
import { PulseChartFilters } from '@components/PulseChart/PulseChartFilters';
import { PulseChartRepoSidebar } from '@components/PulseChart/PulseChartRepoSidebar';
import { QualityLegend } from '@components/PulseChart/QualityLegend';
import { useProviderTerms } from '@hooks/useProviderTerms';
import { CsvChart } from '@utils/exportCsv';
import { PULSE_GRID, formatPulseChartOptions } from '@utils/formatPulseChart';
import { PULSE_CSV, RepositoryPulseCsvRow } from '@utils/formatPulseCsv';
import { useRepositoryPulse } from '../../hooks/useRepositoryPulse';

const TITLE = 'Indicador das Características';
// as recomendações do PO para o pulso (US06.01): sem linhas horizontais e com o nome de cada release uma vez só
const PULSE_OPTIONS = { releaseLabels: 'first-row', horizontalLines: false } as const;

interface Props {
  /** Os dados do pulso: a página os busca, para o botão do topo e o deste card usarem os mesmos. */
  pulse: ReturnType<typeof useRepositoryPulse>;
  /** O CSV das medições do período filtrado. */
  csv: CsvChart<RepositoryPulseCsvRow>;
}

/** Gráfico de pulso (metáfora do eletrocardiograma) de cada característica do repositório, como o pulso do produto. */
export default function RepositoryPulseChart({ pulse, csv }: Readonly<Props>) {
  const { terms } = useProviderTerms();
  const options = useMemo(() => formatPulseChartOptions(pulse.rows, PULSE_OPTIONS), [pulse.rows]);

  let status: 'loading' | 'error' | 'empty' | 'ready' = 'ready';
  if (pulse.hasError) status = 'error';
  else if (pulse.isLoading) status = 'loading';
  else if (!pulse.hasMeasurements) status = 'empty';

  return (
    <DashboardCard
      title={TITLE}
      status={status}
      headerAction={
        <Box display="flex" alignItems="center" flexWrap="wrap" gap="12px">
          <QualityLegend />
          <ExportCsvButton dashboard={PULSE_CSV.repository} chart={csv} />
        </Box>
      }
      loadingContent={<SkeletonBlock width="100%" height={PULSE_GRID.topOffset + 3 * (PULSE_GRID.height + PULSE_GRID.gap)} />}
      loadingMessage="Carregando as medições das características…"
      emptyTitle={`Ainda não há medições das características deste ${terms.repository}`}
      emptyDescription={`Os valores aparecem depois que a Action do MeasureSoftGram analisa o ${terms.repository}.`}
      errorTitle="Não foi possível carregar o indicador das características"
      onRetry={pulse.retry}
    >
      <PulseChartFilters
        startDate={pulse.startDate}
        onStartDateChange={pulse.setStartDate}
        endDate={pulse.endDate}
        onEndDateChange={pulse.setEndDate}
      />

      <Typography variant="body2" color="text.secondary" fontSize="12px">
        Gráfico de pulso por característica • pico = variação entre medições • marcadores = releases • cor = faixa de
        qualidade
      </Typography>

      {pulse.rows.length === 0 ? (
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
          {pulse.rows.map((row, index) => (
            <PulseChartRepoSidebar
              key={row.id}
              name={row.name}
              measurements={row.measurements}
              topOffset={PULSE_GRID.topOffset + index * (PULSE_GRID.height + PULSE_GRID.gap)}
              valueLabel="último valor"
              showIcon={false}
            />
          ))}
          <ReactEcharts option={options} notMerge style={{ height: `${options.height}px`, width: '100%' }} />
        </Box>
      )}
    </DashboardCard>
  );
}

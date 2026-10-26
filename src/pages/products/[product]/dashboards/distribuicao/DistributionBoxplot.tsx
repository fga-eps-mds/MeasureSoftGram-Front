import React, { useMemo } from 'react';
import { Box, Theme, Typography } from '@mui/material';
import DashboardCard from '@components/DashboardCard';
import ExportCsvButton from '@components/ExportCsvButton';
import { DistributionEntity, DistributionSummary } from '@customTypes/product';
import { DASHBOARD_COLORS } from '@utils/dashboardColors';
import { buildHistogram } from '@utils/distributionHistogram';
import { formatCount, formatStatistic } from '@utils/distributionSummary';
import { CsvChart } from '@utils/exportCsv';
import {
  BOXPLOT_GRID,
  BOXPLOT_ROW_HEIGHT,
  DISTRIBUTION_COLORS,
  formatLevelBoxplotOptions,
  getLevelBoxplotHeight,
  getLevelBoxplotRows
} from '@utils/formatDistributionCharts';
import { BoxplotCsvRow, DISTRIBUTION_CSV } from '@utils/formatDistributionCsv';
import DistributionChart from './DistributionChart';

export const BOXPLOT_TITLE = 'Boxplot e percentis do nível';

/** Colunas da tabela de percentis, com duas casas; a mediana fica em negrito e os discrepantes são uma contagem. */
const PERCENTILE_COLUMNS: { label: string; key: keyof DistributionSummary; bold?: boolean }[] = [
  { label: 'P10', key: 'p10' },
  { label: 'Q1', key: 'q1' },
  { label: 'Mediana', key: 'median', bold: true },
  { label: 'Q3', key: 'q3' },
  { label: 'P90', key: 'p90' },
  { label: 'IQR', key: 'iqr' },
  { label: 'Discrepantes', key: 'outliers' }
];

function formatPercentile(summary: DistributionSummary, key: keyof DistributionSummary): string {
  return key === 'outliers' ? formatCount(summary.outliers) : formatStatistic(summary[key]);
}

const VISUALLY_HIDDEN = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0
} as const;

/**
 * Nome da linha na tabela. Com a tabela ao lado do gráfico, o nome já está no eixo e fica só para o leitor de tela;
 * em tela estreita, a tabela fica abaixo do gráfico e mostra o nome.
 */
const nameCell = (theme: Theme) => ({
  padding: '0 10px 0 0',
  textAlign: 'left',
  fontSize: '13px',
  [theme.breakpoints.up('sm')]: VISUALLY_HIDDEN
});

const LEGEND_ITEMS = [
  {
    label: 'Entidade escolhida',
    swatch: { backgroundColor: DISTRIBUTION_COLORS.entityBoxFill, border: `2px solid ${DISTRIBUTION_COLORS.entityBox}` }
  },
  {
    label: 'Filhos no modelo',
    swatch: { backgroundColor: DISTRIBUTION_COLORS.childBoxFill, border: `1.5px solid ${DISTRIBUTION_COLORS.childBox}` }
  },
  {
    label: 'Valor discrepante',
    swatch: {
      borderRadius: '50%',
      width: 9,
      backgroundColor: '#FFFFFF',
      border: `1.5px solid ${DISTRIBUTION_COLORS.outlier}`
    }
  }
];

function BoxplotLegend() {
  return (
    <Box component="ul" display="flex" flexWrap="wrap" gap="4px 16px" margin={0} padding={0} sx={{ listStyle: 'none' }}>
      {LEGEND_ITEMS.map((item) => (
        <Box component="li" key={item.label} display="flex" alignItems="center" gap="6px">
          <Box aria-hidden sx={{ width: 16, height: 9, boxSizing: 'border-box', flexShrink: 0, ...item.swatch }} />
          <Typography fontSize="11px" color={DASHBOARD_COLORS.text}>
            {item.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

/**
 * Boxplot da entidade escolhida e dos filhos dela no modelo (CA6), com a tabela de percentis à direita de cada linha.
 * As linhas da tabela têm a altura das faixas do gráfico e o cabeçalho tem a altura do topo do grid, para ficarem
 * alinhadas. Em tela estreita, só a tabela rola na horizontal.
 */
export default function DistributionBoxplot({
  entity,
  childEntities,
  csv
}: {
  entity: DistributionEntity;
  childEntities: DistributionEntity[];
  /** O CSV do quadro, montado pela página; com ele, o cabeçalho ganha o botão "Exportar .csv". */
  csv?: CsvChart<BoxplotCsvRow>;
}) {
  const rows = useMemo(() => getLevelBoxplotRows(entity, childEntities), [entity, childEntities]);
  const option = useMemo(() => {
    // o eixo x é o mesmo eixo de valores do histograma: 0 a 1, ou a escala da métrica
    const histogram = buildHistogram(
      entity.analyses.map((analysis) => analysis.value),
      entity.level,
      entity.metric_type
    );
    return formatLevelBoxplotOptions(rows, histogram);
  }, [entity, rows]);
  const hasMetricChildren = entity.level === 'measure' && childEntities.some((child) => child.level === 'metric');

  return (
    <DashboardCard
      title={BOXPLOT_TITLE}
      status="ready"
      headerAction={csv && <ExportCsvButton dashboard={DISTRIBUTION_CSV.dashboard} chart={csv} />}
    >
      <Box
        data-testid="boxplot-layout"
        display="grid"
        alignItems="start"
        rowGap="8px"
        sx={{
          // ao lado do gráfico, a tabela rola dentro da coluna dela; em tela estreita, as duas não cabem lado a lado e a
          // tabela vai para baixo do gráfico, ainda com a rolagem horizontal
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'minmax(220px, 1fr) minmax(0, max-content)' }
        }}
      >
        <DistributionChart option={option} height={getLevelBoxplotHeight(rows.length)} />
        <Box
          data-testid="percentile-scroll"
          role="group"
          aria-label="Percentis de cada linha"
          tabIndex={0}
          // relative: o caption e os nomes escondidos (position absolute) ficam presos aqui dentro; sem isso, eles
          // escapam da rolagem e alargam a página em tela estreita
          sx={{ position: 'relative', overflowX: 'auto', minWidth: 0 }}
        >
          <Box component="table" sx={{ borderCollapse: 'collapse', whiteSpace: 'nowrap' }}>
            <Box component="caption" sx={VISUALLY_HIDDEN}>
              Percentis de cada linha do boxplot
            </Box>
            <thead>
              <Box component="tr" sx={{ height: BOXPLOT_GRID.top }}>
                <Box
                  component="th"
                  scope="col"
                  sx={(theme: Theme) => ({
                    ...nameCell(theme),
                    paddingBottom: '6px',
                    verticalAlign: 'bottom',
                    fontSize: '11px',
                    fontWeight: 'normal',
                    color: DASHBOARD_COLORS.mutedText
                  })}
                >
                  Entidade
                </Box>
                {PERCENTILE_COLUMNS.map((column) => (
                  <Box
                    component="th"
                    scope="col"
                    key={column.label}
                    sx={{
                      padding: '0 10px 6px',
                      verticalAlign: 'bottom',
                      textAlign: 'right',
                      fontSize: '11px',
                      fontWeight: 'normal',
                      color: DASHBOARD_COLORS.mutedText
                    }}
                  >
                    {column.label}
                  </Box>
                ))}
              </Box>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <Box
                  component="tr"
                  key={row.entity.key}
                  data-testid="percentile-row"
                  data-chosen={index === 0 ? 'true' : undefined}
                  sx={{
                    height: BOXPLOT_ROW_HEIGHT,
                    backgroundColor: index === 0 ? DISTRIBUTION_COLORS.entityRow : undefined
                  }}
                >
                  <Box
                    component="th"
                    scope="row"
                    sx={(theme: Theme) => ({
                      ...nameCell(theme),
                      fontWeight: index === 0 ? 'bold' : 'normal',
                      color: index === 0 ? DASHBOARD_COLORS.primary : DASHBOARD_COLORS.text
                    })}
                  >
                    {row.entity.name}
                  </Box>
                  {PERCENTILE_COLUMNS.map((column) => (
                    <Box
                      component="td"
                      key={column.label}
                      sx={{
                        padding: '0 10px',
                        textAlign: 'right',
                        fontSize: '13px',
                        fontWeight: column.bold ? 'bold' : undefined,
                        color: index === 0 ? DASHBOARD_COLORS.primary : DASHBOARD_COLORS.text
                      }}
                    >
                      {formatPercentile(row.entity.summary, column.key)}
                    </Box>
                  ))}
                </Box>
              ))}
            </tbody>
          </Box>
        </Box>
      </Box>

      <BoxplotLegend />
      <Typography fontSize="12px" color={DASHBOARD_COLORS.mutedText}>
        Cada caixa vai do Q1 ao Q3, com a marca da mediana, e as hastes vão até o último valor dentro dos limites. Os
        círculos vazados são os valores discrepantes.
      </Typography>
      {hasMetricChildren && (
        <Typography data-testid="boxplot-metric-note" fontSize="12px" color={DASHBOARD_COLORS.mutedText}>
          As métricas de {entity.name} têm escala própria e não cabem no eixo de 0 a 1. Escolha o nível Métrica para ver
          a distribuição de cada uma.
        </Typography>
      )}
    </DashboardCard>
  );
}

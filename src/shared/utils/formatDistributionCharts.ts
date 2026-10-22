import type { CustomSeriesRenderItemAPI, CustomSeriesRenderItemParams, CustomSeriesRenderItemReturn } from 'echarts';
import { DASHBOARD_COLORS } from '@utils/dashboardColors';
import { formatAxisValue, formatBinLabel, Histogram } from '@utils/distributionHistogram';
import { formatAnalysisCount, formatCount, formatStatistic } from '@utils/distributionSummary';
import { escapeHtml } from '@utils/formatOverviewCharts';
import { COLOR_TOKENS } from '@utils/formatPulseChart';
import { BoxplotStats, OutlierGroup } from '@utils/metricDistribution';

/** Cores dos gráficos da distribuição: barras em azul claro, caixa na cor primária e discrepantes em laranja. */
export const DISTRIBUTION_COLORS = {
  bar: '#7BA7D7',
  barHover: DASHBOARD_COLORS.planned,
  box: DASHBOARD_COLORS.primary,
  boxFill: DASHBOARD_COLORS.infoBackground,
  outlier: COLOR_TOKENS.warning
};

const AXIS_LABEL = { color: DASHBOARD_COLORS.mutedText, fontSize: 11 };
const SPLIT_LINE = { lineStyle: { color: DASHBOARD_COLORS.gridLine } };

/** Discrepante em círculo vazado; o que está sob o mouse ou clicado fica preenchido (TASK21.03.05). */
export const OUTLIER_STYLE = {
  cursor: 'pointer',
  itemStyle: { color: '#FFFFFF', borderColor: DISTRIBUTION_COLORS.outlier, borderWidth: 1.5 },
  emphasis: { itemStyle: { color: DISTRIBUTION_COLORS.outlier } }
};

/** Cada faixa é [início, fim, análises]: um retângulo de início a fim, do zero até a contagem. */
export function renderHistogramBar(
  _params: CustomSeriesRenderItemParams,
  api: CustomSeriesRenderItemAPI
): CustomSeriesRenderItemReturn {
  const [left, top] = api.coord([Number(api.value(0)), Number(api.value(2))]);
  const [right, bottom] = api.coord([Number(api.value(1)), 0]);
  return {
    type: 'rect',
    // 1px de folga de cada lado separa as barras vizinhas
    shape: { x: left + 1, y: top, width: Math.max(right - left - 2, 1), height: bottom - top },
    style: { fill: DISTRIBUTION_COLORS.bar },
    emphasis: { style: { fill: DISTRIBUTION_COLORS.barHover } }
  };
}

/** Ponto maior quando junta mais de uma análise. */
export function outlierSymbolSize(groups: OutlierGroup[]) {
  return (_value: unknown, { dataIndex }: { dataIndex: number }) => (groups[dataIndex].analyses.length > 1 ? 12 : 9);
}

/** Caixa e hastes no tooltip do boxplot, com duas casas; o params.value do boxplot traz o índice da categoria na frente. */
export function formatBoxTooltip(stats: BoxplotStats, title = 'Boxplot'): string {
  return [
    `<strong>${escapeHtml(title)}</strong>`,
    `Haste superior: ${formatStatistic(stats.high)}`,
    `Q3: ${formatStatistic(stats.q3)}`,
    `Mediana: ${formatStatistic(stats.median)}`,
    `Q1: ${formatStatistic(stats.q1)}`,
    `Haste inferior: ${formatStatistic(stats.low)}`
  ].join('<br/>');
}

/** Altura do histograma das análises. */
export const HISTOGRAM_CHART_HEIGHT = 280;

/**
 * Margens do grid do histograma, em px, com o containLabel desligado: a régua A a E, desenhada fora do ECharts, usa as
 * mesmas para ficar alinhada às faixas do eixo.
 */
export const HISTOGRAM_GRID_SIDES = { left: 56, right: 24 };

/**
 * Histograma das análises da entidade (CA4): uma barra por faixa de valor, do início ao fim dela, com a quantidade de
 * análises. O eixo x é o das faixas; nos valores de 0 a 1, a régua A a E fica abaixo dele, fora do gráfico.
 */
export function formatHistogramOptions(histogram: Histogram, entityName: string) {
  const { bins } = histogram;
  const total = bins.reduce((sum, bin) => sum + bin.count, 0);
  const filled = bins
    .filter((bin) => bin.count > 0)
    .map((bin) => `${formatBinLabel(bin, histogram)}: ${formatAnalysisCount(bin.count)}`)
    .join('; ');

  return {
    animation: false,
    aria: {
      enabled: true,
      label: {
        description: `Histograma de ${entityName}: ${formatAnalysisCount(total)} em faixas de ${formatAxisValue(
          histogram.width
        )}. ${filled}.`
      }
    },
    tooltip: { trigger: 'item', confine: true },
    grid: { ...HISTOGRAM_GRID_SIDES, top: 32, bottom: 32 },
    xAxis: {
      type: 'value',
      min: histogram.min,
      max: histogram.max,
      interval: histogram.width,
      splitLine: { show: false },
      axisLine: { lineStyle: { color: DASHBOARD_COLORS.gridLine } },
      axisLabel: { ...AXIS_LABEL, formatter: formatAxisValue, hideOverlap: true }
    },
    yAxis: {
      type: 'value',
      name: 'Análises',
      nameTextStyle: AXIS_LABEL,
      minInterval: 1,
      axisLabel: { ...AXIS_LABEL, formatter: formatCount },
      splitLine: SPLIT_LINE
    },
    series: [
      {
        id: 'histogram',
        type: 'custom',
        renderItem: renderHistogramBar,
        // sem o encode, o eixo y leria o fim da faixa (dimensão 1) em vez da contagem
        encode: { x: [0, 1], y: 2 },
        data: bins.map((bin) => [bin.start, bin.end, bin.count]),
        tooltip: {
          formatter: ({ dataIndex }: { dataIndex: number }) =>
            `${formatBinLabel(bins[dataIndex], histogram)}<br/><strong>${formatAnalysisCount(
              bins[dataIndex].count
            )}</strong>`
        }
      }
    ]
  };
}

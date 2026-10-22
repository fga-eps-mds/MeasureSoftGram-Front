import type { CustomSeriesRenderItemAPI, CustomSeriesRenderItemParams, CustomSeriesRenderItemReturn } from 'echarts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DistributionAnalysis, DistributionEntity } from '@customTypes/product';
import { DASHBOARD_COLORS } from '@utils/dashboardColors';
import { DensityPoint } from '@utils/distributionDensity';
import { formatAxisValue, formatBinLabel, Histogram, isUnitScale } from '@utils/distributionHistogram';
import { formatAnalysisCount, formatCount, formatPeriod, formatStatistic } from '@utils/distributionSummary';
import { escapeHtml } from '@utils/formatOverviewCharts';
import { COLOR_TOKENS } from '@utils/formatPulseChart';
import { BoxplotStats, getBoxplotStats, groupOutliers, OutlierGroup } from '@utils/metricDistribution';

/** Cores dos gráficos da distribuição: barras em azul claro, caixa na cor primária e discrepantes em laranja. */
export const DISTRIBUTION_COLORS = {
  bar: '#7BA7D7',
  barHover: DASHBOARD_COLORS.planned,
  box: DASHBOARD_COLORS.primary,
  boxFill: DASHBOARD_COLORS.infoBackground,
  outlier: COLOR_TOKENS.warning,
  density: DASHBOARD_COLORS.planned,
  densityFill: 'rgba(123, 167, 215, 0.3)',
  median: DASHBOARD_COLORS.primary,
  // boxplot do nível: a entidade escolhida em cor escura, sobre o fundo destacado, e os filhos em cor clara
  entityBox: DASHBOARD_COLORS.primary,
  entityBoxFill: 'rgba(43, 77, 111, 0.35)',
  entityRow: DASHBOARD_COLORS.infoBackground,
  childBox: '#7BA7D7',
  childBoxFill: '#FFFFFF'
};

const LEGEND = { textStyle: { color: DASHBOARD_COLORS.text, fontSize: 11 }, itemWidth: 16, itemHeight: 8 };

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

/** Eixo x de valor de um quadro alinhado ao histograma: o mesmo início, fim e intervalo das faixas. */
function histogramValueAxis(histogram: Histogram) {
  return {
    type: 'value',
    min: histogram.min,
    max: histogram.max,
    interval: histogram.width,
    splitLine: { show: false },
    axisLine: { lineStyle: { color: DASHBOARD_COLORS.gridLine } },
    axisLabel: { ...AXIS_LABEL, formatter: formatAxisValue, hideOverlap: true }
  };
}

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
    xAxis: histogramValueAxis(histogram),
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

/** Rótulo da mediana na legenda: "Mediana (0,55)". */
export function formatMedianLabel(median: number | null): string {
  return `Mediana (${formatStatistic(median)})`;
}

/**
 * Curva de densidade das análises (CA5), no mesmo eixo x e com as mesmas margens do histograma, para os dois quadros
 * ficarem alinhados lado a lado. A área fica preenchida em cor clara. A mediana do Service é uma linha vertical
 * tracejada numa série sem pontos, só para ter o próprio item na legenda.
 */
export function formatDensityOptions(
  points: DensityPoint[],
  histogram: Histogram,
  median: number | null,
  entityName: string
) {
  const peak = points.reduce((top, point) => (point.y > top.y ? point : top), points[0]);
  const medianLabel = formatMedianLabel(median);
  const hasMedian = median !== null;
  const medianSentence = hasMedian ? ` ${medianLabel}.` : '';

  return {
    animation: false,
    aria: {
      enabled: true,
      label: {
        description: `Curva de densidade de ${entityName}, de ${formatAxisValue(histogram.min)} a ${formatAxisValue(
          histogram.max
        )}, com o pico em ${formatStatistic(peak.x)}.${medianSentence}`
      }
    },
    tooltip: {
      trigger: 'axis',
      confine: true,
      formatter: (params: { value: number[] }[]) => {
        const [x, y] = params[0].value;
        return `${formatStatistic(x)}<br/>Densidade: <strong>${formatStatistic(y)}</strong>`;
      }
    },
    legend: {
      ...LEGEND,
      top: 0,
      right: HISTOGRAM_GRID_SIDES.right,
      data: hasMedian ? ['Densidade', medianLabel] : ['Densidade']
    },
    grid: { ...HISTOGRAM_GRID_SIDES, top: 40, bottom: 32 },
    xAxis: histogramValueAxis(histogram),
    yAxis: {
      type: 'value',
      axisLabel: { ...AXIS_LABEL, formatter: (value: number) => formatAxisValue(Number(value.toFixed(2))) },
      splitLine: SPLIT_LINE
    },
    series: [
      {
        id: 'density',
        name: 'Densidade',
        type: 'line',
        data: points.map((point) => [point.x, point.y]),
        showSymbol: false,
        lineStyle: { color: DISTRIBUTION_COLORS.density, width: 2 },
        itemStyle: { color: DISTRIBUTION_COLORS.density },
        areaStyle: { color: DISTRIBUTION_COLORS.densityFill }
      },
      ...(hasMedian
        ? [
            {
              id: 'median',
              name: medianLabel,
              type: 'line',
              data: [],
              itemStyle: { color: DISTRIBUTION_COLORS.median },
              lineStyle: { color: DISTRIBUTION_COLORS.median, type: 'dashed' },
              markLine: {
                silent: true,
                symbol: 'none',
                label: { show: false },
                lineStyle: { color: DISTRIBUTION_COLORS.median, width: 2, type: 'dashed' },
                data: [{ xAxis: median }]
              }
            }
          ]
        : [])
    ]
  };
}

/** Altura da dispersão no tempo, ao lado do resumo estatístico. */
export const SCATTER_CHART_HEIGHT = 320;

/** Discrepantes listados no texto acessível; os outros entram só na contagem. */
const MAX_DESCRIBED_OUTLIERS = 10;

/** Data e hora de uma análise no tooltip: "17/08/2026 às 10:00". */
export function formatAnalysisDateTime(date: string | number): string {
  return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

function toScatterPoint(analysis: DistributionAnalysis): [number, number] {
  return [new Date(analysis.date).getTime(), analysis.value];
}

function describeOutliers(outliers: DistributionAnalysis[]): string {
  if (!outliers.length) return 'Nenhum valor discrepante.';
  const listed = outliers
    .slice(0, MAX_DESCRIBED_OUTLIERS)
    .map((analysis) => `${formatStatistic(analysis.value)} em ${format(new Date(analysis.date), 'dd/MM/yyyy')}`);
  const rest = outliers.length - listed.length;
  const more = rest > 0 ? ` e mais ${formatCount(rest)}` : '';
  const label = outliers.length === 1 ? '1 valor discrepante' : `${formatCount(outliers.length)} valores discrepantes`;
  return `${label}: ${listed.join(', ')}${more}.`;
}

/**
 * Dispersão das análises no tempo (CA7): um ponto por análise na data dela, com os discrepantes do Service em
 * círculo vazado. O Q1, a mediana e o Q3 vêm do resumo do Service: a faixa clara do Q1 ao Q3 é um markArea e a
 * mediana, um markLine, cada um numa série sem pontos. A da faixa tem o próprio item na legenda; a da mediana fica
 * fora dela e leva o valor no rótulo da linha. O eixo y vai de 0 a 1, ou segue a escala da métrica, como o histograma.
 */
export function formatScatterOptions(entity: DistributionEntity, histogram: Histogram) {
  const { analyses, summary } = entity;
  const regular = analyses.filter((analysis) => !analysis.is_outlier);
  const outliers = analyses.filter((analysis) => analysis.is_outlier);
  const { q1, median, q3 } = summary;
  const hasQuartiles = q1 !== null && q3 !== null;
  const period = analyses.length ? formatPeriod(analyses[0].date, analyses[analyses.length - 1].date) : '';
  const quartiles = `Q1 ${formatStatistic(q1)}, mediana ${formatStatistic(median)} e Q3 ${formatStatistic(q3)}`;

  return {
    animation: false,
    aria: {
      enabled: true,
      label: {
        description: `Dispersão de ${entity.name} no tempo: ${formatAnalysisCount(
          analyses.length
        )} de ${period}. ${quartiles}. ${describeOutliers(outliers)}`
      }
    },
    tooltip: {
      trigger: 'item',
      confine: true,
      formatter: ({ value }: { value: [number, number] }) =>
        `${formatAnalysisDateTime(value[0])}<br/><strong>${formatStatistic(value[1])}</strong>`
    },
    legend: {
      ...LEGEND,
      top: 0,
      data: [
        { name: 'Análise', icon: 'circle' },
        { name: 'Valor discrepante', icon: 'circle' },
        {
          name: 'Q1 a Q3',
          icon: 'rect',
          itemStyle: { color: DISTRIBUTION_COLORS.boxFill, borderColor: DISTRIBUTION_COLORS.density, borderWidth: 1 }
        }
      ]
    },
    // a legenda quebra em duas linhas no cartão de 360 px: o topo do grid tem espaço para a segunda
    grid: { left: 8, right: 24, top: 60, bottom: 8, containLabel: true },
    xAxis: {
      type: 'time',
      boundaryGap: ['3%', '3%'],
      splitLine: { show: false },
      axisLine: { lineStyle: { color: DASHBOARD_COLORS.gridLine } },
      axisLabel: {
        ...AXIS_LABEL,
        hideOverlap: true,
        formatter: (value: number) => format(new Date(value), 'd MMM', { locale: ptBR })
      }
    },
    yAxis: {
      type: 'value',
      min: histogram.min,
      max: histogram.max,
      axisLabel: { ...AXIS_LABEL, formatter: formatAxisValue },
      splitLine: SPLIT_LINE
    },
    series: [
      {
        id: 'analyses',
        name: 'Análise',
        type: 'scatter',
        symbolSize: 7,
        itemStyle: { color: DISTRIBUTION_COLORS.density },
        data: regular.map(toScatterPoint)
      },
      {
        id: 'outliers',
        name: 'Valor discrepante',
        type: 'scatter',
        symbolSize: 9,
        ...OUTLIER_STYLE,
        data: outliers.map(toScatterPoint)
      },
      {
        id: 'iqr',
        name: 'Q1 a Q3',
        type: 'line',
        data: [],
        itemStyle: { color: DISTRIBUTION_COLORS.boxFill },
        markArea: hasQuartiles
          ? { silent: true, itemStyle: { color: DISTRIBUTION_COLORS.boxFill }, data: [[{ yAxis: q1 }, { yAxis: q3 }]] }
          : undefined
      },
      {
        id: 'median',
        name: 'Mediana',
        type: 'line',
        data: [],
        markLine:
          median === null
            ? undefined
            : {
                silent: true,
                symbol: 'none',
                lineStyle: { color: DISTRIBUTION_COLORS.median, width: 2, type: 'dashed' },
                label: {
                  position: 'insideEndTop',
                  color: DISTRIBUTION_COLORS.median,
                  fontSize: 11,
                  // fundo claro para o rótulo não se misturar com os pontos que passam por trás dele
                  backgroundColor: 'rgba(255, 255, 255, 0.85)',
                  padding: [1, 4],
                  formatter: `Mediana ${formatStatistic(median)}`
                },
                data: [{ yAxis: median }]
              }
      }
    ]
  };
}

/** Uma linha do boxplot do nível: a entidade escolhida ou um filho dela, com a caixa e as hastes. */
export interface LevelBoxplotRow {
  entity: DistributionEntity;
  stats: BoxplotStats;
}

/**
 * Linhas do boxplot do nível (CA6): a entidade escolhida e os filhos com análise, na ordem em que o Service manda (a da
 * configuração da release). Só entram os filhos na mesma escala da entidade: abaixo da medida vêm as métricas, com o
 * valor bruto, que não cabem no eixo de 0 a 1. Um filho sem análise (resumo sem quartis) fica fora.
 */
export function getLevelBoxplotRows(entity: DistributionEntity, children: DistributionEntity[]): LevelBoxplotRow[] {
  const sameScale = children.filter((child) => isUnitScale(child.level) === isUnitScale(entity.level));
  return [entity, ...sameScale].flatMap((item) => {
    const stats = getBoxplotStats(item.summary, item.analyses);
    return stats ? [{ entity: item, stats }] : [];
  });
}

/** Altura de cada linha do boxplot do nível; a tabela de percentis usa a mesma, para as linhas ficarem alinhadas. */
export const BOXPLOT_ROW_HEIGHT = 44;

/** Margens do grid do boxplot do nível, em px: o cabeçalho da tabela de percentis tem a altura do topo. */
export const BOXPLOT_GRID = { top: 36, bottom: 28, left: 124, right: 24 };

/** Largura dos nomes das linhas no eixo y; um nome maior é cortado com reticências. */
const BOXPLOT_LABEL_WIDTH = 112;

/**
 * Num gráfico estreito (o cartão em 360 px), os nomes e a margem direita encolhem para sobrar espaço para as caixas;
 * os nomes inteiros ficam na tabela de percentis, logo abaixo.
 */
const BOXPLOT_NARROW = { maxWidth: 360, labelWidth: 56, right: 12 };

// um discrepante a menos de 1/36 do eixo do centro de um grupo entra nele: nenhum ponto fica escondido atrás de outro
const OUTLIER_SPREAD = 36;

/** Altura do gráfico: o topo, uma faixa por linha e a base com os valores do eixo. */
export function getLevelBoxplotHeight(rows: number): number {
  return BOXPLOT_GRID.top + rows * BOXPLOT_ROW_HEIGHT + BOXPLOT_GRID.bottom;
}

interface LevelOutlierPoint extends OutlierGroup {
  row: LevelBoxplotRow;
}

/** Entidade e valor e data de cada análise do ponto, escapados porque o tooltip do ECharts é HTML. */
export function formatLevelOutlierTooltip({ row, analyses }: LevelOutlierPoint): string {
  const title = analyses.length === 1 ? 'Valor discrepante' : `${formatCount(analyses.length)} valores discrepantes`;
  return [
    `<span style="color:${DISTRIBUTION_COLORS.outlier};font-weight:bold">${title}</span>`,
    escapeHtml(row.entity.name),
    ...analyses.map(
      (analysis) => `<strong>${formatStatistic(analysis.value)}</strong> em ${formatAnalysisDateTime(analysis.date)}`
    )
  ].join('<br/>');
}

function describeBoxplotRow({ entity, stats }: LevelBoxplotRow): string {
  const count = stats.outliers.length;
  let outliers = `${formatCount(count)} valores discrepantes`;
  if (count === 0) outliers = 'nenhum valor discrepante';
  else if (count === 1) outliers = '1 valor discrepante';
  return `${entity.name}: mediana ${formatStatistic(stats.median)}, Q1 ${formatStatistic(
    stats.q1
  )} e Q3 ${formatStatistic(stats.q3)}, ${outliers}`;
}

/**
 * Boxplot do nível (CA6): uma linha para a entidade escolhida e uma para cada filho dela no modelo, no mesmo eixo de
 * valores do histograma (0 a 1, ou a escala da métrica). A primeira linha é a da entidade, em cor escura e sobre o
 * fundo destacado; os filhos vêm em cor clara, na ordem da configuração da release. Caixa e hastes vêm de
 * getBoxplotStats, e os discrepantes do Service ficam em círculo vazado, numa série à parte. O grid tem margens fixas
 * em px e cada linha tem BOXPLOT_ROW_HEIGHT, para a tabela de percentis ao lado ficar alinhada às linhas.
 */
export function formatLevelBoxplotOptions(rows: LevelBoxplotRow[], histogram: Histogram) {
  const [chosen, ...children] = rows;
  const tolerance = (histogram.max - histogram.min) / OUTLIER_SPREAD;
  const outliers: LevelOutlierPoint[] = rows.flatMap((row) =>
    groupOutliers(row.stats.outliers, tolerance).map((group) => ({ ...group, row }))
  );
  let childrenSentence = '';
  if (children.length === 1) childrenSentence = ' e do filho no modelo';
  else if (children.length > 1) childrenSentence = ` e dos ${formatCount(children.length)} filhos no modelo`;

  return {
    animation: false,
    aria: {
      enabled: true,
      label: {
        description: `Boxplot de ${chosen.entity.name}${childrenSentence}, de ${formatAxisValue(
          histogram.min
        )} a ${formatAxisValue(histogram.max)}. ${rows.map(describeBoxplotRow).join('; ')}.`
      }
    },
    tooltip: { trigger: 'item', confine: true },
    grid: BOXPLOT_GRID,
    xAxis: { ...histogramValueAxis(histogram), splitLine: SPLIT_LINE },
    yAxis: {
      type: 'category',
      // a entidade escolhida fica no topo, e os filhos descem na ordem da release
      inverse: true,
      data: rows.map((row) => row.entity.key),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        ...AXIS_LABEL,
        color: DASHBOARD_COLORS.text,
        width: BOXPLOT_LABEL_WIDTH,
        overflow: 'truncate',
        formatter: (_key: string, index: number) =>
          index === 0 ? `{chosen|${rows[index].entity.name.replace(/[{}|]/g, '')}}` : rows[index].entity.name,
        // na v5 o estilo rich não herda a fonte do label, então ele declara a sua
        rich: { chosen: { color: DASHBOARD_COLORS.primary, fontSize: 11, fontWeight: 'bold' } }
      },
      // as cores do splitArea são cíclicas: só a primeira faixa fica destacada, sem repetir nas faixas ímpares
      splitArea: {
        show: true,
        areaStyle: {
          color: [DISTRIBUTION_COLORS.entityRow, ...new Array<string>(rows.length - 1).fill('transparent')]
        }
      }
    },
    series: [
      {
        id: 'boxplot',
        name: 'Boxplot',
        type: 'boxplot',
        boxWidth: [10, 20],
        data: rows.map(({ stats }, index) => ({
          value: [stats.low, stats.q1, stats.median, stats.q3, stats.high],
          itemStyle:
            index === 0
              ? { color: DISTRIBUTION_COLORS.entityBoxFill, borderColor: DISTRIBUTION_COLORS.entityBox, borderWidth: 2 }
              : { color: DISTRIBUTION_COLORS.childBoxFill, borderColor: DISTRIBUTION_COLORS.childBox, borderWidth: 1.5 }
        })),
        tooltip: {
          formatter: ({ dataIndex }: { dataIndex: number }) =>
            formatBoxTooltip(rows[dataIndex].stats, rows[dataIndex].entity.name)
        }
      },
      {
        id: 'outliers',
        name: 'Valor discrepante',
        type: 'scatter',
        z: 3,
        symbolSize: outlierSymbolSize(outliers),
        ...OUTLIER_STYLE,
        data: outliers.map((point) => [point.value, point.row.entity.key]),
        tooltip: { formatter: ({ dataIndex }: { dataIndex: number }) => formatLevelOutlierTooltip(outliers[dataIndex]) }
      }
    ],
    media: [
      {
        query: { maxWidth: BOXPLOT_NARROW.maxWidth },
        option: {
          grid: {
            left: BOXPLOT_NARROW.labelWidth + BOXPLOT_GRID.left - BOXPLOT_LABEL_WIDTH,
            right: BOXPLOT_NARROW.right
          },
          yAxis: { axisLabel: { width: BOXPLOT_NARROW.labelWidth } }
        }
      }
    ]
  };
}

import type { CustomSeriesRenderItemAPI, CustomSeriesRenderItemParams, CustomSeriesRenderItemReturn } from 'echarts';
import { FileMetricKey, MetricDistributionFile, MetricDistributionSummary } from '@customTypes/product';
import { DASHBOARD_COLORS } from '@utils/dashboardColors';
import { escapeHtml } from '@utils/formatOverviewCharts';
import { COLOR_TOKENS } from '@utils/formatPulseChart';
import {
  BoxplotStats,
  buildHistogramBins,
  describeReferencePosition,
  formatBinLabel,
  formatFileCount,
  formatMetricValue,
  formatNumber,
  formatOutlierCount,
  getBinWidth,
  getBoxplotStats,
  getFileMetric,
  groupOutliers,
  MetricKind,
  MetricReference,
  OutlierGroup
} from '@utils/metricDistribution';

/** Cores do protótipo: barras em azul claro, caixa na cor primária, outliers em laranja e referência em verde. */
export const DISTRIBUTION_COLORS = {
  bar: '#7BA7D7',
  barHover: DASHBOARD_COLORS.planned,
  box: DASHBOARD_COLORS.primary,
  boxFill: DASHBOARD_COLORS.infoBackground,
  outlier: COLOR_TOKENS.warning,
  reference: COLOR_TOKENS.adequate,
  referenceLabel: '#D4EFE3'
};

/** Altura do gráfico de um repositório: rótulos da referência, histograma, boxplot e legenda do eixo x. */
export const DISTRIBUTION_CHART_HEIGHT = 384;

const AXIS_LABEL = { color: DASHBOARD_COLORS.mutedText, fontSize: 11 };
const SPLIT_LINE = { lineStyle: { color: DASHBOARD_COLORS.gridLine } };
// mesmo left/right nos dois grids, com containLabel desligado: o histograma e o boxplot dividem o eixo x
const GRID_SIDES = { left: 64, right: 32 };
// enterable deixa o mouse entrar no tooltip para rolar a lista de arquivos; o hideDelay dá tempo de chegar nele. O
// confine só prende a posição: sem max-width, um caminho longo estica a caixa (nowrap do ECharts) e a página rola
const TOOLTIP = {
  trigger: 'item',
  triggerOn: 'mousemove|click',
  enterable: true,
  confine: true,
  hideDelay: 300,
  extraCssText: 'max-width: 420px; white-space: normal; overflow-wrap: anywhere;'
};
// um outlier a menos de 1/36 do eixo do centro de um grupo entra nele: uns 17 px num gráfico de 600 px, mais que os
// 13,5 px do ponto maior, então nenhum ponto fica escondido atrás de outro
const OUTLIER_SPREAD = 36;

const OUTLIER_STYLE = {
  cursor: 'pointer',
  itemStyle: { color: '#FFFFFF', borderColor: DISTRIBUTION_COLORS.outlier, borderWidth: 1.5 },
  // o outlier sob o mouse ou clicado fica preenchido, como no protótipo
  emphasis: { itemStyle: { color: DISTRIBUTION_COLORS.outlier } }
};

const REFERENCE_LINE = {
  silent: true,
  symbol: 'none',
  lineStyle: { color: DISTRIBUTION_COLORS.reference, type: 'dashed', width: 1.5 }
};

const REFERENCE_LABEL = {
  show: true,
  color: DISTRIBUTION_COLORS.reference,
  fontSize: 11,
  fontWeight: 'bold',
  backgroundColor: DISTRIBUTION_COLORS.referenceLabel,
  padding: [2, 6],
  borderRadius: 3,
  // na v5 o estilo rich não herda a fonte do label, então cada estilo declara a sua
  rich: {
    value: { color: DISTRIBUTION_COLORS.reference, fontSize: 11, fontWeight: 'bold' },
    measure: { color: DISTRIBUTION_COLORS.reference, fontSize: 10, lineHeight: 14 }
  }
};

/** No rich text do ECharts a chave fecha o bloco {estilo|texto}, então ela sai do texto. */
function richText(text: string): string {
  return text.replace(/[{}]/g, '');
}

/** Cada faixa é [início, fim, arquivos]: um retângulo de início a fim, do zero até a contagem. */
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

/** Ponto maior quando junta mais de um arquivo. */
export function outlierSymbolSize(groups: OutlierGroup[]) {
  return (_value: unknown, { dataIndex }: { dataIndex: number }) => (groups[dataIndex].files.length > 1 ? 12 : 9);
}

/** Caixa e bigodes; o params.value do boxplot traz o índice da categoria na frente, então não é usado. */
export function formatBoxTooltip(stats: BoxplotStats, kind: MetricKind, title = 'Boxplot'): string {
  const value = (item: number) => formatMetricValue(item, kind);
  return [
    `<strong>${escapeHtml(title)}</strong>`,
    `Bigode superior: ${value(stats.high)}`,
    `3º quartil: ${value(stats.q3)}`,
    `Mediana: ${value(stats.median)}`,
    `1º quartil: ${value(stats.q1)}`,
    `Bigode inferior: ${value(stats.low)}`
  ].join('<br/>');
}

/**
 * Arquivos de um ponto de outliers (CA5), escapados porque o tooltip do ECharts é HTML. Lista todos os caminhos; com
 * muitos arquivos no mesmo ponto, a lista rola dentro do tooltip. A posição em relação à faixa de referência vai numa
 * linha só quando vale para o grupo inteiro; senão, vai ao lado de cada arquivo.
 */
export function formatOutlierTooltip(
  group: OutlierGroup,
  metric: FileMetricKey,
  reference: MetricReference | null,
  repository?: string
): string {
  const { kind } = getFileMetric(metric);
  const { files } = group;
  const lowest = formatMetricValue(files[0].value, kind);
  const highest = formatMetricValue(files[files.length - 1].value, kind);
  const sameValue = lowest === highest;
  const positions = files.map((file) => describeReferencePosition(file.value, reference, kind));
  const samePosition = positions.every((position) => position === positions[0]);
  const title = files.length === 1 ? 'Outlier' : formatOutlierCount(files.length);
  const paths = files
    .map((file, index) => {
      const valueText = sameValue ? '' : `: ${formatMetricValue(file.value, kind)}`;
      const positionText = samePosition ? '' : ` · ${positions[index]}`;
      return `<strong>${escapeHtml(file.path)}</strong>${valueText}${positionText}`;
    })
    .join('<br/>');

  const lines = [`<span style="color:${DISTRIBUTION_COLORS.outlier};font-weight:bold">${title}</span>`];
  if (repository) lines.push(escapeHtml(repository));
  lines.push(files.length > 1 ? `<div style="max-height:160px;overflow-y:auto">${paths}</div>` : paths);
  lines.push(sameValue ? `${metric}: ${lowest}` : `${metric}: ${lowest} a ${highest}`);
  if (samePosition && positions[0]) lines.push(positions[0]);
  return lines.join('<br/>');
}

// quantos caminhos de outliers entram na descrição acessível; o resto vira "e mais N"
const MAX_DESCRIBED_OUTLIERS = 10;

/**
 * Caminhos e valores dos outliers em texto puro para a descrição para leitores de tela (CA5), do mais distante da
 * mediana ao mais próximo, até 10 arquivos; o que passar disso vira "e mais N". Vazio sem outliers.
 */
function describeOutlierFiles(outliers: MetricDistributionFile[], median: number, kind: MetricKind): string {
  const byDistance = [...outliers].sort((a, b) => Math.abs(b.value - median) - Math.abs(a.value - median));
  const listed = byDistance
    .slice(0, MAX_DESCRIBED_OUTLIERS)
    .map((file) => `${file.path} (${formatMetricValue(file.value, kind)})`)
    .join(', ');
  const rest = byDistance.length - MAX_DESCRIBED_OUTLIERS;
  return rest > 0 ? `${listed} e mais ${rest}` : listed;
}

/** Rótulo da linha de referência; o do máximo traz a medida na segunda linha, como no protótipo. */
function referenceLabel(reference: MetricReference, kind: MetricKind, bound: 'min' | 'max'): string {
  if (bound === 'min') return `Mín. de referência = ${formatMetricValue(reference.min_threshold, kind)}`;
  const value = formatMetricValue(reference.max_threshold, kind);
  return `{value|Máx. de referência = ${value}}\n{measure|medida: ${richText(reference.measureName)}}`;
}

/** Linhas tracejadas verticais do mínimo e do máximo (CA4); os rótulos ficam só no gráfico de cima. */
function verticalReferenceLines(
  reference: MetricReference | null,
  kind: MetricKind,
  axisMax: number,
  withLabels: boolean
) {
  if (!reference) return undefined;
  if (!withLabels) {
    return {
      ...REFERENCE_LINE,
      label: { show: false },
      data: [{ xAxis: reference.min_threshold }, { xAxis: reference.max_threshold }]
    };
  }

  const line = (value: number, formatter: string, rowDistance: number) => ({
    xAxis: value,
    label: {
      formatter,
      // o rótulo cresce para dentro do gráfico, e o do máximo fica uma linha acima do do mínimo
      align: value > axisMax / 2 ? 'right' : 'left',
      distance: [0, rowDistance]
    }
  });

  return {
    ...REFERENCE_LINE,
    label: { ...REFERENCE_LABEL, position: 'end' },
    data: [
      line(reference.min_threshold, referenceLabel(reference, kind, 'min'), 6),
      line(reference.max_threshold, referenceLabel(reference, kind, 'max'), 30)
    ]
  };
}

export interface DistributionChartData {
  metric: FileMetricKey;
  files: MetricDistributionFile[];
  stats: BoxplotStats;
  reference: MetricReference | null;
}

/**
 * Histograma (grid de cima, série custom com um retângulo por faixa) e boxplot de Tukey deitado (grid de baixo,
 * com os outliers), no mesmo eixo x (CA3).
 */
export function formatDistributionChartOptions({ metric, files, stats, reference }: DistributionChartData) {
  const { description, kind } = getFileMetric(metric);
  const bins = buildHistogramBins(
    files.map((file) => file.value),
    kind
  );
  // o eixo é o das faixas, do zero até o fim da última; sem arquivos, vai até o bigode de cima
  const axisMax = bins.length ? bins[bins.length - 1].end : Math.max(1, stats.high);
  // como no protótipo, uma marca a cada 2 faixas do histograma (faixas de 5: 0, 10, 20…)
  // reduce, e não Math.max(...valores): espalhar um repositório grande nos argumentos estoura a pilha
  const maxValue = files.reduce((max, file) => Math.max(max, file.value), 0);
  const tickInterval = 2 * getBinWidth(kind, maxValue);
  const sharedXAxis = { type: 'value', min: 0, max: axisMax, interval: tickInterval, splitLine: { show: false } };
  const formatValue = (value: number) => formatMetricValue(value, kind);
  const outlierGroups = groupOutliers(stats.outliers, axisMax / OUTLIER_SPREAD);
  const fileCount = formatFileCount(files.length);
  const median = formatValue(stats.median);
  const outlierCount = formatOutlierCount(stats.outliers.length);
  const outlierFiles = describeOutlierFiles(stats.outliers, stats.median, kind);
  const outlierSentence = outlierFiles ? ` Outliers: ${outlierFiles}.` : '';

  return {
    animation: false,
    aria: {
      enabled: true,
      label: {
        description: `Histograma e boxplot de ${metric}: ${fileCount}, mediana ${median}, ${outlierCount}.${outlierSentence}`
      }
    },
    tooltip: TOOLTIP,
    // sem referência não há rótulos no topo: o histograma sobe e ocupa o espaço, e o boxplot não muda de lugar
    grid: [
      reference ? { ...GRID_SIDES, top: 64, height: 200 } : { ...GRID_SIDES, top: 16, height: 248 },
      { ...GRID_SIDES, top: 284, height: 44 }
    ],
    xAxis: [
      {
        ...sharedXAxis,
        gridIndex: 0,
        axisLabel: { show: false },
        axisTick: { show: false },
        axisLine: { lineStyle: { color: DASHBOARD_COLORS.gridLine } }
      },
      {
        ...sharedXAxis,
        gridIndex: 1,
        name: `${metric} (${description})`,
        nameLocation: 'middle',
        nameGap: 30,
        nameTextStyle: { color: DASHBOARD_COLORS.text, fontSize: 12 },
        axisLabel: { ...AXIS_LABEL, formatter: formatValue }
      }
    ],
    yAxis: [
      {
        gridIndex: 0,
        type: 'value',
        name: 'Arquivos',
        // embaixo do zero, como no protótipo, longe dos rótulos da referência que ficam no topo
        nameLocation: 'start',
        nameGap: 10,
        nameTextStyle: AXIS_LABEL,
        minInterval: 1,
        axisLabel: { ...AXIS_LABEL, formatter: formatNumber },
        splitLine: SPLIT_LINE
      },
      {
        gridIndex: 1,
        type: 'category',
        data: ['Boxplot'],
        axisTick: { show: false },
        axisLine: { show: false },
        // margem maior: um outlier em 0 fica no começo do eixo, encostado no rótulo
        axisLabel: { ...AXIS_LABEL, margin: 14 }
      }
    ],
    series: [
      {
        id: 'histogram',
        type: 'custom',
        xAxisIndex: 0,
        yAxisIndex: 0,
        renderItem: renderHistogramBar,
        // sem o encode, o eixo y leria o fim da faixa (dimensão 1) em vez da contagem
        encode: { x: [0, 1], y: 2 },
        data: bins.map((bin) => [bin.start, bin.end, bin.count]),
        tooltip: {
          formatter: ({ dataIndex }: { dataIndex: number }) =>
            `${formatBinLabel(bins[dataIndex], kind)}<br/><strong>${formatFileCount(bins[dataIndex].count)}</strong>`
        },
        markLine: verticalReferenceLines(reference, kind, axisMax, true)
      },
      {
        id: 'boxplot',
        type: 'boxplot',
        xAxisIndex: 1,
        yAxisIndex: 1,
        // sem layout: com o eixo y de categoria o ECharts já deita a caixa
        boxWidth: [18, 28],
        itemStyle: { color: DISTRIBUTION_COLORS.boxFill, borderColor: DISTRIBUTION_COLORS.box, borderWidth: 1.5 },
        data: [[stats.low, stats.q1, stats.median, stats.q3, stats.high]],
        tooltip: { formatter: () => formatBoxTooltip(stats, kind) },
        markLine: verticalReferenceLines(reference, kind, axisMax, false)
      },
      {
        id: 'outliers',
        type: 'scatter',
        xAxisIndex: 1,
        yAxisIndex: 1,
        ...OUTLIER_STYLE,
        symbolSize: outlierSymbolSize(outlierGroups),
        // [valor, 0]: 0 é o índice da única categoria do eixo y
        data: outlierGroups.map((group) => [group.value, 0]),
        tooltip: {
          formatter: ({ dataIndex }: { dataIndex: number }) =>
            formatOutlierTooltip(outlierGroups[dataIndex], metric, reference)
        }
      }
    ]
  };
}

/** Altura do gráfico de comparação, com o nome, o n e a mediana de cada repositório embaixo da caixa. */
export const COMPARISON_CHART_HEIGHT = 440;

export interface ComparisonRepository {
  name: string;
  summary: MetricDistributionSummary;
  files: MetricDistributionFile[];
}

const MAX_CATEGORY_NAME = 18;

// três linhas (nome, n e mediana): o n e a mediana não se sobrepõem nem com muitos arquivos. O nome perde o prefixo
// comum e fica com até 18 caracteres (uns 128 px); com muitos repositórios de nome longo num gráfico estreito, ainda
// pode encostar no vizinho, e o nome inteiro fica no tooltip
const CATEGORY_RICH = {
  name: { color: DASHBOARD_COLORS.text, fontSize: 13, fontWeight: 'bold', lineHeight: 20 },
  meta: { color: DASHBOARD_COLORS.mutedText, fontSize: 11, lineHeight: 15 }
};

/** Prefixo comum a todos os nomes, até o último '-' ou '_' (ex.: '2026.2-MeasureSoftGram-'); vazio com menos de 2. */
function commonNamePrefix(names: string[]): string {
  if (names.length < 2) return '';
  const common = names.reduce((prefix, name) => {
    let size = 0;
    while (size < prefix.length && prefix[size] === name[size]) size += 1;
    return prefix.slice(0, size);
  }, names[0]);
  // o '.' fica de fora: em '2026.1-…' x '2026.2-…' ele cortaria dentro do semestre
  return common.slice(0, Math.max(common.lastIndexOf('-'), common.lastIndexOf('_')) + 1);
}

/**
 * Nome do repositório no eixo, sem o prefixo comum; se ainda for longo, perde o meio, porque o começo e o fim são o
 * que diferencia os nomes. O nome inteiro fica no tooltip.
 */
function categoryName(name: string, prefix: string): string {
  const clean = richText(name.slice(prefix.length) || name);
  if (clean.length <= MAX_CATEGORY_NAME) return clean;
  const head = Math.ceil((MAX_CATEGORY_NAME - 1) / 2);
  return `${clean.slice(0, head)}…${clean.slice(head + 1 - MAX_CATEGORY_NAME)}`;
}

/** Percentual fica na escala de 0 a 100, a menos que algum valor passe disso. */
export function getPercentAxisMax({ max }: { max: number }): number {
  return Math.max(100, max);
}

/** Linhas tracejadas horizontais da comparação, com rótulos curtos na margem direita, fora das caixas (CA4). */
function horizontalReferenceLines(reference: MetricReference | null, kind: MetricKind) {
  if (!reference) return undefined;
  const line = (value: number, text: string) => ({
    yAxis: value,
    label: { formatter: `${text} ${formatMetricValue(value, kind)}` }
  });
  return {
    ...REFERENCE_LINE,
    // dentro do grid, o rótulo opaco (z 5) cobriria a última caixa (z 2); em 'end', ele fica depois do fim da linha
    label: { ...REFERENCE_LABEL, position: 'end' },
    data: [line(reference.min_threshold, 'Mín.'), line(reference.max_threshold, 'Máx.')]
  };
}

/** Um boxplot de Tukey por repositório na mesma métrica, com os outliers de cada um (CA6). */
export function formatComparisonChartOptions(
  metric: FileMetricKey,
  repositories: ComparisonRepository[],
  reference: MetricReference | null = null,
  repositoryTerm = 'repositório'
) {
  const { kind } = getFileMetric(metric);
  const formatValue = (value: number) => formatMetricValue(value, kind);
  const boxes = repositories.map((repository) => ({
    ...repository,
    stats: getBoxplotStats(repository.summary, repository.files)
  }));
  const prefix = commonNamePrefix(boxes.map((box) => box.name));
  // os outliers vêm em ordem crescente: o último é o maior valor da caixa
  const dataMax = boxes.reduce(
    (max, { stats }) => Math.max(max, stats.high, stats.outliers[stats.outliers.length - 1]?.value ?? stats.high),
    1
  );
  const axisMax = kind === 'percent' ? getPercentAxisMax({ max: dataMax }) : dataMax;
  // o eixo da comparação é vertical e mais baixo (uns 320 px): a tolerância do agrupamento dobra
  const outliers = boxes.flatMap((box, index) =>
    groupOutliers(box.stats.outliers, axisMax / (OUTLIER_SPREAD / 2)).map((group) => ({
      group,
      index,
      repository: box.name
    }))
  );
  const summaries = boxes
    .map((box) => {
      const outlierFiles = describeOutlierFiles(box.stats.outliers, box.stats.median, kind);
      const outlierText = outlierFiles ? `, outliers: ${outlierFiles}` : '';
      return `${box.name}: mediana ${formatValue(box.summary.median)}${outlierText}`;
    })
    .join('; ');

  return {
    animation: false,
    aria: { enabled: true, label: { description: `Um boxplot de ${metric} por ${repositoryTerm}. ${summaries}.` } },
    tooltip: TOOLTIP,
    // com referência, a margem direita recebe os rótulos: "Máx. 100%" pede até uns 85 px com uma fonte larga
    grid: { left: 64, right: reference ? 96 : 32, top: 40, bottom: 76 },
    xAxis: {
      type: 'category',
      data: boxes.map((box) => box.name),
      axisTick: { show: false },
      axisLine: { lineStyle: { color: DASHBOARD_COLORS.gridLine } },
      axisLabel: {
        interval: 0,
        formatter: (name: string, index: number) => {
          const { count, median } = boxes[index].summary;
          const label = categoryName(name, prefix);
          const total = formatNumber(count);
          // de 10 para cima, sem casa decimal: "mediana 87,2%" passa da faixa de cada repositório com 6 deles num
          // gráfico estreito (uns 620 px). Abaixo de 10 a casa fica, senão 0,4% de duplicação viraria "mediana 0%".
          // O valor exato fica no tooltip da caixa e na descrição para leitores de tela
          const medianText = formatValue(Math.abs(median) >= 10 ? Math.round(median) : median);
          return `{name|${label}}\n{meta|n = ${total}}\n{meta|mediana ${medianText}}`;
        },
        rich: CATEGORY_RICH
      }
    },
    yAxis: {
      type: 'value',
      name: metric,
      // embaixo, à esquerda, abaixo das três linhas de rótulo, como na tela 03
      nameLocation: 'start',
      nameGap: 60,
      min: 0,
      max: kind === 'percent' ? getPercentAxisMax : undefined,
      nameTextStyle: AXIS_LABEL,
      axisLabel: { ...AXIS_LABEL, formatter: formatValue },
      splitLine: SPLIT_LINE
    },
    series: [
      {
        id: 'boxplot',
        type: 'boxplot',
        // sem layout: com o eixo x de categoria o ECharts deixa as caixas em pé, lado a lado
        boxWidth: [16, 48],
        itemStyle: { color: DISTRIBUTION_COLORS.boxFill, borderColor: DISTRIBUTION_COLORS.box, borderWidth: 1.5 },
        data: boxes.map(({ stats }) => [stats.low, stats.q1, stats.median, stats.q3, stats.high]),
        tooltip: {
          formatter: ({ dataIndex }: { dataIndex: number }) =>
            formatBoxTooltip(boxes[dataIndex].stats, kind, boxes[dataIndex].name)
        },
        markLine: horizontalReferenceLines(reference, kind)
      },
      {
        id: 'outliers',
        type: 'scatter',
        ...OUTLIER_STYLE,
        symbolSize: outlierSymbolSize(outliers.map(({ group }) => group)),
        // [índice do repositório no eixo x, valor]
        data: outliers.map(({ group, index }) => [index, group.value]),
        tooltip: {
          formatter: ({ dataIndex }: { dataIndex: number }) =>
            formatOutlierTooltip(outliers[dataIndex].group, metric, reference, outliers[dataIndex].repository)
        }
      }
    ]
  };
}

import type { CustomSeriesRenderItemAPI, CustomSeriesRenderItemParams, CustomSeriesRenderItemReturn } from 'echarts';
import { CorrelationLevel, CorrelationPair, RepositoryCorrelation } from '@customTypes/product';
import { DASHBOARD_COLORS } from '@utils/dashboardColors';
import { formatCount, formatStatistic, MISSING_STATISTIC } from '@utils/distributionSummary';
import { escapeHtml } from '@utils/formatOverviewCharts';
import { CsvChart, CsvColumn } from '@utils/exportCsv';

/** Escala divergente da correlação: laranja em −1, cinza claro em 0 e azul em +1, como na referência. */
export const CORRELATION_COLORS = {
  negative: '#B8741A',
  neutral: '#F1F3F5',
  positive: DASHBOARD_COLORS.primary,
  bubble: '#3F6EA8',
  cell: '#F4F5F7'
};

/** Lado de cada célula das matrizes, em px. */
export const CORRELATION_CELL_SIZE = 64;

/** Espaço à direita da última coluna para o nome da diagonal, em px; um nome maior é cortado com reticências. */
export const CORRELATION_LABEL_WIDTH = 180;

/** Folga entre as células, em px. */
const CELL_GAP = 4;

/** Abaixo desta luminância o número da célula fica branco. */
const DARK_FILL_LUMINANCE = 0.45;

/** Coeficiente não significativo: célula e número mais claros. */
const NOT_SIGNIFICANT_OPACITY = 0.45;

export const METHOD_LABELS: Record<NonNullable<RepositoryCorrelation['method']>, string> = {
  pearson: 'Pearson',
  spearman: 'Spearman'
};

export const CORRELATION_LEVEL_LABELS: Record<CorrelationLevel, string> = {
  characteristic: 'Característica',
  subcharacteristic: 'Subcaracterística'
};

/** Nome do nível no plural, como aparece nas frases da página. */
export const CORRELATION_LEVEL_PLURALS: Record<CorrelationLevel, string> = {
  characteristic: 'características',
  subcharacteristic: 'subcaracterísticas'
};

/** Uma célula do triângulo de baixo: o par, com a posição da linha e da coluna na ordem das entidades. */
export interface CorrelationCell {
  pair: CorrelationPair;
  rowIndex: number;
  columnIndex: number;
  rowName: string;
  columnName: string;
}

function toRgb(hex: string): number[] {
  return [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16));
}

/** Componentes RGB da cor do coeficiente: do cinza claro em 0 até o laranja em −1 ou o azul em +1. */
function blend(coefficient: number): number[] {
  const from = toRgb(CORRELATION_COLORS.neutral);
  const to = toRgb(coefficient < 0 ? CORRELATION_COLORS.negative : CORRELATION_COLORS.positive);
  const weight = Math.min(Math.abs(coefficient), 1);
  return from.map((channel, index) => Math.round(channel + (to[index] - channel) * weight));
}

/** Cor da célula pelo coeficiente, na escala divergente de −1 a +1. */
export function correlationColor(coefficient: number): string {
  return `rgb(${blend(coefficient).join(', ')})`;
}

/** Número branco sobre as células escuras e escuro sobre as claras. */
export function correlationTextColor(coefficient: number): string {
  const [r, g, b] = blend(coefficient);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < DARK_FILL_LUMINANCE ? '#FFFFFF' : DASHBOARD_COLORS.text;
}

/** Os pares do Service com a posição de cada um na matriz e os nomes das duas entidades. */
export function getCorrelationCells(correlation: RepositoryCorrelation): CorrelationCell[] {
  const keys = correlation.entities.map((entity) => entity.key);
  return correlation.pairs.map((pair) => {
    const rowIndex = keys.indexOf(pair.row);
    const columnIndex = keys.indexOf(pair.column);
    return {
      pair,
      rowIndex,
      columnIndex,
      rowName: correlation.entities[rowIndex].name,
      columnName: correlation.entities[columnIndex].name
    };
  });
}

function methodLabel(correlation: RepositoryCorrelation): string {
  return correlation.method ? METHOD_LABELS[correlation.method] : '';
}

/** Tooltip das duas matrizes: o par e o coeficiente, como "Maintainability × Reliability: Spearman = 0,71". */
export function formatPairTooltip(cell: CorrelationCell, correlation: RepositoryCorrelation): string {
  const names = `${escapeHtml(cell.rowName)} × ${escapeHtml(cell.columnName)}`;
  if (cell.pair.coefficient === null) return `${names}: sem correlação<br/>Uma delas não variou entre as releases`;
  return `${names}: ${methodLabel(correlation)} = <strong>${formatStatistic(cell.pair.coefficient)}</strong>`;
}

/**
 * Linha da página (CA3): "20 releases de AI · 8 características · coeficiente aplicado: Spearman (distribuição não
 * normal em 1 de 8 características)", com as releases deixadas de fora por falta de valor, quando houver.
 */
export function formatCorrelationInfo(correlation: RepositoryCorrelation): string {
  const releases = correlation.releases.length;
  const entities = correlation.entities.length;
  const noun = CORRELATION_LEVEL_PLURALS[correlation.level];
  // a linha só aparece com as matrizes, que precisam de pelo menos 3 releases
  const parts = [
    `${formatCount(releases)} releases de ${correlation.repository.name}`,
    `${formatCount(entities)} ${noun}`
  ];
  if (correlation.method && correlation.non_normal !== null) {
    const normality = correlation.non_normal
      ? `distribuição não normal em ${formatCount(correlation.non_normal)} de ${formatCount(entities)} ${noun}`
      : `distribuição normal nas ${formatCount(entities)} ${noun}`;
    parts.push(`coeficiente aplicado: ${methodLabel(correlation)} (${normality})`);
  }
  const excluded = correlation.excluded_releases;
  if (excluded) {
    parts.push(
      excluded === 1
        ? '1 release deixada de fora por falta de valor'
        : `${formatCount(excluded)} releases deixadas de fora por falta de valor`
    );
  }
  return parts.join(' · ');
}

/** Nota da legenda (CA4): "Itálico e opaco: não significativo (|r| < 0,44, p < 0,05, n = 20)". */
export function formatSignificanceNote(correlation: RepositoryCorrelation): string {
  return `Itálico e opaco: não significativo (|r| < ${formatStatistic(
    correlation.critical_value
  )}, p < 0,05, n = ${formatCount(correlation.releases.length)})`;
}

/** Texto acessível das matrizes: o coeficiente de cada par e se ele é significativo. */
export function describeCorrelation(correlation: RepositoryCorrelation, kind: string): string {
  const pairs = getCorrelationCells(correlation).map(({ pair, rowName, columnName }) => {
    if (pair.coefficient === null) return `${rowName} × ${columnName}: sem correlação`;
    const significance = pair.significant ? '' : ', não significativo';
    return `${rowName} × ${columnName}: ${formatStatistic(pair.coefficient)}${significance}`;
  });
  return `${kind} de ${methodLabel(correlation)} entre ${formatCount(correlation.entities.length)} ${
    CORRELATION_LEVEL_PLURALS[correlation.level]
  } de ${correlation.repository.name} em ${formatCount(correlation.releases.length)} releases. ${pairs.join('; ')}.`;
}

/** Largura e altura do gráfico: uma célula por entidade e, à direita, o espaço do último nome da diagonal. */
export function getCorrelationChartSize(entities: number) {
  const side = entities * CORRELATION_CELL_SIZE;
  return { width: side + CORRELATION_LABEL_WIDTH, height: side };
}

/** Célula da posição [coluna, linha], já sem a folga entre as células. */
function cellRect(api: CustomSeriesRenderItemAPI) {
  const [x, y] = api.coord([api.value(0), api.value(1)]);
  const [width, height] = api.size?.([1, 1]) as number[];
  return {
    x: x - width / 2 + CELL_GAP / 2,
    y: y - height / 2 + CELL_GAP / 2,
    width: width - CELL_GAP,
    height: height - CELL_GAP
  };
}

/** Nome da entidade na diagonal, alinhado à esquerda da célula e avançando sobre o triângulo de cima, que fica vazio. */
function renderDiagonalName(names: string[]) {
  return (params: CustomSeriesRenderItemParams, api: CustomSeriesRenderItemAPI): CustomSeriesRenderItemReturn => {
    const rect = cellRect(api);
    return {
      type: 'text',
      style: {
        text: names[params.dataIndex],
        x: rect.x + 4,
        y: rect.y + rect.height / 2,
        verticalAlign: 'middle',
        fill: DASHBOARD_COLORS.primary,
        fontSize: 12,
        fontWeight: 'bold',
        width: CORRELATION_LABEL_WIDTH - 8,
        overflow: 'truncate'
      }
    };
  };
}

function renderCorrelationCell(cells: CorrelationCell[]) {
  return (params: CustomSeriesRenderItemParams, api: CustomSeriesRenderItemAPI): CustomSeriesRenderItemReturn => {
    const { pair } = cells[params.dataIndex];
    const rect = cellRect(api);
    const { coefficient, significant } = pair;
    const opacity = coefficient !== null && significant ? 1 : NOT_SIGNIFICANT_OPACITY;
    return {
      type: 'group',
      children: [
        {
          type: 'rect',
          shape: { ...rect, r: 4 },
          style: {
            fill: coefficient === null ? CORRELATION_COLORS.cell : correlationColor(coefficient),
            opacity: coefficient === null ? 1 : opacity
          }
        },
        {
          type: 'text',
          style: {
            text: formatStatistic(coefficient),
            x: rect.x + rect.width / 2,
            y: rect.y + rect.height / 2,
            align: 'center',
            verticalAlign: 'middle',
            fontSize: 13,
            fontWeight: significant ? 'bold' : 'normal',
            fontStyle: significant ? 'normal' : 'italic',
            // sobre a célula opaca o número fica escuro, para não sumir no fundo claro
            fill: coefficient !== null && significant ? correlationTextColor(coefficient) : DASHBOARD_COLORS.mutedText
          }
        }
      ]
    };
  };
}

function renderBubbleCell(cells: CorrelationCell[]) {
  return (params: CustomSeriesRenderItemParams, api: CustomSeriesRenderItemAPI): CustomSeriesRenderItemReturn => {
    const { pair } = cells[params.dataIndex];
    const rect = cellRect(api);
    const center = { cx: rect.x + rect.width / 2, cy: rect.y + rect.height / 2 };
    const background = { type: 'rect' as const, shape: { ...rect, r: 4 }, style: { fill: CORRELATION_COLORS.cell } };
    if (pair.coefficient === null) {
      return {
        type: 'group',
        children: [
          background,
          {
            type: 'text',
            style: {
              text: MISSING_STATISTIC,
              x: center.cx,
              y: center.cy,
              align: 'center',
              verticalAlign: 'middle',
              fill: DASHBOARD_COLORS.mutedText
            }
          }
        ]
      };
    }
    const color = pair.coefficient < 0 ? CORRELATION_COLORS.negative : CORRELATION_COLORS.bubble;
    // o raio é proporcional a |r|; o mínimo deixa visível um coeficiente perto de zero
    const radius = Math.max(Math.abs(pair.coefficient), 0.08) * (rect.width / 2 - 4);
    return {
      type: 'group',
      children: [
        background,
        {
          type: 'circle',
          shape: { ...center, r: radius },
          style: pair.significant ? { fill: color } : { fill: '#FFFFFF', stroke: color, lineWidth: 2 }
        }
      ]
    };
  };
}

/** Eixos, grid e as séries comuns às duas matrizes: o triângulo de baixo, com os nomes na diagonal. */
function formatMatrixBase(
  correlation: RepositoryCorrelation,
  cells: CorrelationCell[],
  description: string,
  renderCell: (params: CustomSeriesRenderItemParams, api: CustomSeriesRenderItemAPI) => CustomSeriesRenderItemReturn
) {
  const names = correlation.entities.map((entity) => entity.name);
  const indexes = names.map((_name, index) => index);
  const side = names.length * CORRELATION_CELL_SIZE;
  const hiddenAxis = { type: 'category', data: indexes, show: false };

  return {
    animation: false,
    aria: { enabled: true, label: { description } },
    tooltip: { trigger: 'item', confine: true },
    grid: { left: 0, top: 0, width: side, height: side },
    xAxis: hiddenAxis,
    // a primeira entidade fica no topo, como na referência
    yAxis: { ...hiddenAxis, inverse: true },
    series: [
      {
        id: 'pairs',
        type: 'custom',
        renderItem: renderCell,
        data: cells.map((cell) => [cell.columnIndex, cell.rowIndex]),
        tooltip: {
          formatter: ({ dataIndex }: { dataIndex: number }) => formatPairTooltip(cells[dataIndex], correlation)
        }
      },
      {
        id: 'names',
        type: 'custom',
        silent: true,
        tooltip: { show: false },
        renderItem: renderDiagonalName(names),
        data: indexes.map((index) => [index, index])
      }
    ]
  };
}

/** Matriz de correlação (CA4): o coeficiente com duas casas, na cor da escala de −1 a +1. */
export function formatCorrelationMatrixOptions(correlation: RepositoryCorrelation) {
  const cells = getCorrelationCells(correlation);
  return formatMatrixBase(
    correlation,
    cells,
    describeCorrelation(correlation, 'Matriz de correlação'),
    renderCorrelationCell(cells)
  );
}

/** Matriz de bolhas (CA5): o tamanho do círculo é |r|, a cor é o sinal e o não significativo fica vazado. */
export function formatCorrelationBubbleOptions(correlation: RepositoryCorrelation) {
  const cells = getCorrelationCells(correlation);
  return formatMatrixBase(
    correlation,
    cells,
    describeCorrelation(correlation, 'Matriz de bolhas'),
    renderBubbleCell(cells)
  );
}

/** Nome do dashboard e de cada matriz nos arquivos exportados. */
export const CORRELATION_CSV = { dashboard: 'relacoes', matrix: 'matriz-correlacao', bubbles: 'matriz-bolhas' };

export type CorrelationCsvRow = {
  repository: string;
  level: string;
  row: string;
  column: string;
  coefficient: number | null;
  p_value: number | null;
  significant: string;
  method: string;
  releases: number;
};

const CORRELATION_CSV_COLUMNS: CsvColumn<CorrelationCsvRow>[] = [
  { key: 'repository', title: 'Repositório' },
  { key: 'level', title: 'Nível' },
  { key: 'row', title: 'Linha' },
  { key: 'column', title: 'Coluna' },
  { key: 'coefficient', title: 'Coeficiente' },
  { key: 'p_value', title: 'p-valor' },
  { key: 'significant', title: 'Significativo' },
  { key: 'method', title: 'Coeficiente aplicado' },
  { key: 'releases', title: 'Releases' }
];

/** CSV de uma matriz: um par por linha, com o coeficiente e o p-valor do Service, sem arredondar. */
export function formatCorrelationCsv(correlation: RepositoryCorrelation, name: string): CsvChart<CorrelationCsvRow> {
  return {
    name,
    columns: CORRELATION_CSV_COLUMNS,
    rows: getCorrelationCells(correlation).map(({ pair, rowName, columnName }) => ({
      repository: correlation.repository.name,
      level: CORRELATION_LEVEL_LABELS[correlation.level],
      row: rowName,
      column: columnName,
      coefficient: pair.coefficient,
      p_value: pair.p_value,
      significant: pair.significant ? 'sim' : 'não',
      method: methodLabel(correlation),
      releases: correlation.releases.length
    }))
  };
}

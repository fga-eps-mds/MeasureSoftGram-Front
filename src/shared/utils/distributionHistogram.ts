import { DistributionLevel } from '@customTypes/product';

export interface HistogramBin {
  /** Início da faixa, inclusive. */
  start: number;
  /** Fim da faixa, exclusive; no eixo de 0 a 1, a última faixa inclui o 1. */
  end: number;
  count: number;
}

export interface Histogram {
  /** Valores de 0 a 1 (TSQMI, característica, subcaracterística e medida), com a régua A a E. */
  unit: boolean;
  width: number;
  /** Início e fim do eixo: o começo da primeira faixa e o fim da última. */
  min: number;
  max: number;
  bins: HistogramBin[];
  /** Métrica INT: as faixas juntam inteiros, e o rótulo mostra o primeiro e o último inteiro de cada uma. */
  integer: boolean;
}

/** No eixo de 0 a 1, faixas de 0,10 (CA4). */
export const UNIT_BIN_WIDTH = 0.1;
const UNIT_BINS = 10;
const TARGET_METRIC_BINS = 10;
// folga para o ponto flutuante: 0,3 ÷ 0,1 dá 2,9999999999999996 e cairia na faixa de 0,2
const EPSILON = 1e-9;

/** Só a métrica guarda o valor bruto; os outros níveis vão de 0 a 1. */
export function isUnitScale(level: DistributionLevel): boolean {
  return level !== 'metric';
}

/** Tira o ruído do ponto flutuante de uma borda de faixa (0,1 × 3 = 0,30000000000000004). */
function clean(value: number): number {
  return Number(value.toPrecision(12));
}

/**
 * Largura das faixas de uma métrica (CA4). O passo bruto é a amplitude ÷ 10, para umas 10 barras como no eixo de 0
 * a 1, arredondado para cima até um número "redondo" da mesma ordem de grandeza:
 * - INT: 1, 2 ou 5 × 10^k, com no mínimo 1. A largura é inteira, e cada faixa junta valores inteiros ("40 a 44").
 * - Os outros tipos (FLOAT, PERCENT, MILLISEC…): 1, 2, 2,5 ou 5 × 10^k, que pode ser menor que 1.
 * Com todos os valores iguais, a amplitude é zero e a largura é 1: uma barra só.
 */
export function getMetricBinWidth(min: number, max: number, metricType?: string | null): number {
  const integer = metricType === 'INT';
  const raw = (max - min) / TARGET_METRIC_BINS;
  if (raw <= 0) return 1;

  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const steps = integer ? [1, 2, 5, 10] : [1, 2, 2.5, 5, 10];
  const step = steps.find((item) => clean(item * magnitude) >= raw) ?? 10;
  const width = clean(step * magnitude);
  return integer ? Math.max(1, width) : width;
}

function emptyBins(start: number, width: number, count: number): HistogramBin[] {
  return Array.from({ length: count }, (_, index) => ({
    start: clean(start + index * width),
    end: clean(start + (index + 1) * width),
    count: 0
  }));
}

/**
 * Faixas do histograma das análises (CA4). Nos valores de 0 a 1, o eixo vai de 0 a 1 em 10 faixas de 0,10, e o 1
 * entra na última. Nas métricas, a largura vem de getMetricBinWidth e o eixo vai do múltiplo da largura logo abaixo do
 * mínimo até o fim da faixa do máximo; as faixas são fechadas no início e abertas no fim, então um máximo que cai
 * na borda ganha uma faixa própria, como numa contagem de inteiros. A contagem é só a do desenho: as estatísticas
 * vêm do Service.
 */
export function buildHistogram(values: number[], level: DistributionLevel, metricType?: string | null): Histogram {
  if (isUnitScale(level)) {
    const bins = emptyBins(0, UNIT_BIN_WIDTH, UNIT_BINS);
    values.forEach((value) => {
      const index = Math.min(UNIT_BINS - 1, Math.max(0, Math.floor(value / UNIT_BIN_WIDTH + EPSILON)));
      bins[index].count += 1;
    });
    return { unit: true, integer: false, width: UNIT_BIN_WIDTH, min: 0, max: 1, bins };
  }

  const integer = metricType === 'INT';
  if (!values.length) return { unit: false, integer, width: 1, min: 0, max: 1, bins: [] };

  // reduce, e não Math.min(...valores): espalhar muitas análises nos argumentos estoura a pilha
  const min = values.reduce((result, value) => Math.min(result, value), Infinity);
  const max = values.reduce((result, value) => Math.max(result, value), -Infinity);
  const width = getMetricBinWidth(min, max, metricType);
  const start = clean(Math.floor(min / width + EPSILON) * width);
  const count = Math.floor((max - start) / width + EPSILON) + 1;
  const bins = emptyBins(start, width, count);
  values.forEach((value) => {
    const index = Math.min(count - 1, Math.max(0, Math.floor((value - start) / width + EPSILON)));
    bins[index].count += 1;
  });
  return { unit: false, integer, width, min: start, max: bins[bins.length - 1].end, bins };
}

/** Valor no eixo: com vírgula, sem zeros à direita (0,1; 2,5; 1.200). */
export function formatAxisValue(value: number): string {
  return value.toLocaleString('pt-BR', { maximumFractionDigits: 6 });
}

/** "0,30 a 0,40" no eixo de 0 a 1; "40 a 44" ou "7" numa métrica INT; "0,25 a 0,5" nas outras métricas. */
export function formatBinLabel({ start, end }: HistogramBin, histogram: Pick<Histogram, 'unit' | 'integer'>): string {
  if (histogram.unit) {
    const format = (value: number) => value.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    return `${format(start)} a ${format(end)}`;
  }
  if (histogram.integer) {
    const last = clean(end - 1);
    return last === start ? formatAxisValue(start) : `${formatAxisValue(start)} a ${formatAxisValue(last)}`;
  }
  return `${formatAxisValue(start)} a ${formatAxisValue(end)}`;
}

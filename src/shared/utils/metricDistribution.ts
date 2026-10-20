import {
  FileMetricKey,
  MetricDistributionFile,
  MetricDistributionReference,
  MetricDistributionRepository,
  MetricDistributionSummary
} from '@customTypes/product';
import { ProviderTerms } from '@utils/providerTerminology';
import undelineRemover from '@utils/undelineRemover';

/** Percentuais vão de 0 a 100; contagens são números inteiros por arquivo. */
export type MetricKind = 'percent' | 'count';

export interface FileMetric {
  key: FileMetricKey;
  /** O que a métrica mede em um arquivo, para a legenda do eixo. */
  description: string;
  kind: MetricKind;
}

/**
 * Métricas que o Service guarda por arquivo (FILE_LEVEL_METRICS), na ordem do seletor. O tipo é o do SonarQube:
 * cobertura, densidade de comentários, densidade de duplicação e razão de dívida técnica são percentuais;
 * complexidade e funções são contagens.
 */
export const FILE_METRICS: FileMetric[] = [
  { key: 'complexity', description: 'complexidade ciclomática do arquivo', kind: 'count' },
  { key: 'functions', description: 'funções do arquivo', kind: 'count' },
  { key: 'coverage', description: '% de cobertura de testes do arquivo', kind: 'percent' },
  { key: 'comment_lines_density', description: '% de linhas de comentário no arquivo', kind: 'percent' },
  { key: 'duplicated_lines_density', description: '% de linhas duplicadas no arquivo', kind: 'percent' },
  { key: 'sqale_debt_ratio', description: '% de dívida técnica do arquivo', kind: 'percent' }
];

/** O dashboard abre na complexidade, como no protótipo. */
export const DEFAULT_FILE_METRIC: FileMetricKey = 'complexity';

export function getFileMetric(key: FileMetricKey): FileMetric {
  return FILE_METRICS.find((metric) => metric.key === key) ?? FILE_METRICS[0];
}

/**
 * Métricas cuja medida usa o valor de cada arquivo diretamente (CA4). Complexidade e funções ficam de fora: a
 * medida de arquivos não complexos usa complexity ÷ functions, e os limites dela não valem para o valor bruto.
 */
const METRICS_WITH_REFERENCE: FileMetricKey[] = [
  'coverage',
  'comment_lines_density',
  'duplicated_lines_density',
  'sqale_debt_ratio'
];

/** Nomes das medidas em português; o Service devolve só a chave. */
const MEASURE_NAMES: Record<string, string> = {
  test_coverage: 'Cobertura de testes',
  commented_file_density: 'Densidade de arquivos comentados',
  duplication_absense: 'Ausência de duplicação',
  technical_debt_ratio: 'Razão de dívida técnica'
};

export function getMeasureName(measure: string): string {
  return MEASURE_NAMES[measure] ?? undelineRemover(measure);
}

export interface MetricReference extends MetricDistributionReference {
  /** Nome da medida, para o rótulo da linha. */
  measureName: string;
}

/**
 * Faixa de referência que vira linha no gráfico, ou null. O Service devolve a faixa de non_complex_file_density
 * também para complexity e functions, e ela fica de fora (CA4).
 */
export function getMetricReference(
  metric: FileMetricKey,
  reference?: MetricDistributionReference | null
): MetricReference | null {
  if (!reference || !METRICS_WITH_REFERENCE.includes(metric)) return null;
  return { ...reference, measureName: getMeasureName(reference.measure) };
}

export interface OutlierFences {
  lower: number;
  upper: number;
}

/** Regra padrão do boxplot (CA5): outlier é o arquivo a mais de 1,5 × IQR do 1º ou do 3º quartil. */
export function getOutlierFences({ q1, q3 }: Pick<MetricDistributionSummary, 'q1' | 'q3'>): OutlierFences {
  const iqr = q3 - q1;
  return { lower: q1 - 1.5 * iqr, upper: q3 + 1.5 * iqr };
}

export interface BoxplotStats {
  /** Ponta do bigode de baixo: o menor valor que não é outlier, ou o 1º quartil se esse valor ficar acima dele. */
  low: number;
  q1: number;
  median: number;
  q3: number;
  /** Ponta do bigode de cima: o maior valor que não é outlier, ou o 3º quartil se esse valor ficar abaixo dele. */
  high: number;
  /** Do menor para o maior valor. */
  outliers: MetricDistributionFile[];
}

/**
 * Caixa e bigodes de Tukey. Os quartis vêm do resumo do Service (método inclusive); as pontas dos bigodes e os
 * outliers saem dos arquivos, porque o Service não marca os outliers.
 */
export function getBoxplotStats(summary: MetricDistributionSummary, files: MetricDistributionFile[]): BoxplotStats {
  const { lower, upper } = getOutlierFences(summary);
  const isOutlier = (value: number) => value < lower || value > upper;
  const inliers = files.filter((file) => !isOutlier(file.value)).map((file) => file.value);
  const minInlier = inliers.length ? inliers.reduce((min, value) => Math.min(min, value), Infinity) : summary.min;
  const maxInlier = inliers.length ? inliers.reduce((max, value) => Math.max(max, value), -Infinity) : summary.max;

  return {
    // com o quartil interpolado entre um outlier e um valor comum, o bigode pararia dentro da caixa: ele vai no
    // máximo até o quartil (a mesma regra do matplotlib)
    low: Math.min(minInlier, summary.q1),
    q1: summary.q1,
    median: summary.median,
    q3: summary.q3,
    high: Math.max(maxInlier, summary.q3),
    outliers: files.filter((file) => isOutlier(file.value)).sort((a, b) => a.value - b.value)
  };
}

export interface OutlierGroup {
  /** Onde o ponto é desenhado: no meio entre o menor e o maior valor do grupo. */
  value: number;
  files: MetricDistributionFile[];
}

/** Onde o grupo é desenhado: no meio entre o menor e o maior valor. */
function groupCenter(files: MetricDistributionFile[]): number {
  return (files[0].value + files[files.length - 1].value) / 2;
}

/**
 * Junta os outliers (em ordem crescente) que cairiam no mesmo ponto do gráfico: valores iguais ou a até `tolerance`
 * do centro do grupo, onde o ponto é desenhado. Assim dois pontos vizinhos ficam a mais de `tolerance`. Sem isso, só
 * o ponto de cima recebe o mouse e os outros caminhos ficam escondidos (CA5).
 */
export function groupOutliers(outliers: MetricDistributionFile[], tolerance = 0): OutlierGroup[] {
  const groups = outliers.reduce<MetricDistributionFile[][]>((result, file) => {
    const current = result[result.length - 1];
    if (current && file.value - groupCenter(current) <= tolerance) current.push(file);
    else result.push([file]);
    return result;
  }, []);
  return groups.map((group) => ({ value: groupCenter(group), files: group }));
}

export interface HistogramBin {
  /** Início da faixa, inclusive. */
  start: number;
  /** Fim da faixa, exclusive (a última faixa inclui o fim). */
  end: number;
  count: number;
}

const PERCENT_BIN_WIDTH = 5;
const MAX_COUNT_BINS = 20;

/** Percentuais em faixas de 5 pontos; contagens em faixas de inteiros, no máximo 20 a partir do zero. */
export function getBinWidth(kind: MetricKind, maxValue: number): number {
  if (kind === 'percent') return PERCENT_BIN_WIDTH;
  return Math.max(1, Math.ceil((Math.floor(maxValue) + 1) / MAX_COUNT_BINS));
}

/**
 * Faixas do histograma, sempre a partir do zero (CA3): percentuais de 0 a 100 (a dívida técnica pode passar de
 * 100 e alarga o eixo) e contagens em faixas de números inteiros.
 */
export function buildHistogramBins(values: number[], kind: MetricKind): HistogramBin[] {
  if (!values.length) return [];

  const maxValue = values.reduce((max, value) => Math.max(max, value), 0);
  const width = getBinWidth(kind, maxValue);
  const end =
    kind === 'percent'
      ? Math.max(100, Math.ceil(maxValue / width) * width)
      : (Math.floor(maxValue / width) + 1) * width;
  const bins = Array.from({ length: Math.round(end / width) }, (_, index) => ({
    start: index * width,
    end: (index + 1) * width,
    count: 0
  }));

  values.forEach((value) => {
    const index = Math.min(bins.length - 1, Math.max(0, Math.floor(value / width)));
    bins[index].count += 1;
  });
  return bins;
}

/** Até uma casa decimal, com vírgula e separador de milhar: 10,4 e 1.284. */
export function formatNumber(value: number): string {
  return value.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
}

export function formatMetricValue(value: number, kind: MetricKind): string {
  return kind === 'percent' ? `${formatNumber(value)}%` : formatNumber(value);
}

/** "5 a 9" numa faixa de inteiros [5, 10); "10% a 15%" numa faixa de percentual. */
export function formatBinLabel({ start, end }: HistogramBin, kind: MetricKind): string {
  if (kind === 'percent') return `${formatNumber(start)}% a ${formatNumber(end)}%`;
  if (end - start === 1) return formatNumber(start);
  return `${formatNumber(start)} a ${formatNumber(end - 1)}`;
}

export function formatFileCount(count: number): string {
  return count === 1 ? '1 arquivo' : `${formatNumber(count)} arquivos`;
}

export function formatOutlierCount(count: number): string {
  return count === 1 ? '1 outlier' : `${formatNumber(count)} outliers`;
}

/** Aviso dos arquivos sem linhas de código, que ficam fora como no cálculo das medidas (CA7). */
export function formatExcludedFiles(count: number): string {
  if (count === 0) return 'Nenhum arquivo excluído';
  return count === 1 ? '1 arquivo excluído' : `${formatNumber(count)} arquivos excluídos`;
}

/** Onde o valor fica em relação à faixa de referência, para o tooltip do outlier. */
export function describeReferencePosition(
  value: number,
  reference: MetricReference | null,
  kind: MetricKind
): string | null {
  if (!reference) return null;
  if (value > reference.max_threshold) {
    return `Acima do máximo de referência (${formatMetricValue(reference.max_threshold, kind)})`;
  }
  if (value < reference.min_threshold) {
    return `Abaixo do mínimo de referência (${formatMetricValue(reference.min_threshold, kind)})`;
  }
  return 'Dentro da faixa de referência';
}

export interface SummaryRow {
  label: string;
  value: string;
}

/** Linhas do quadro de resumo (CA3), na ordem do protótipo. */
export function getSummaryRows(
  summary: MetricDistributionSummary,
  kind: MetricKind,
  outlierCount: number
): SummaryRow[] {
  const metricValue = (value: number) => formatMetricValue(value, kind);
  return [
    { label: 'Arquivos analisados', value: formatNumber(summary.count) },
    { label: 'Mínimo', value: metricValue(summary.min) },
    { label: '1º quartil', value: metricValue(summary.q1) },
    { label: 'Mediana', value: metricValue(summary.median) },
    { label: '3º quartil', value: metricValue(summary.q3) },
    { label: 'Máximo', value: metricValue(summary.max) },
    { label: 'Média', value: metricValue(summary.mean) },
    { label: 'Desvio padrão', value: metricValue(summary.std_dev) },
    { label: 'Outliers', value: formatNumber(outlierCount) }
  ];
}

export interface StateMessage {
  title: string;
  description: string;
}

type RepositoryTerms = Pick<ProviderTerms, 'repository' | 'repositories'>;

const NO_COLLECTION_HINT = 'Confira se a análise do SonarCloud roda na pipeline antes da coleta do MeasureSoftGram.';

/** Orientação quando a coleta veio, mas sem a métrica pedida; a cobertura depende do relatório de testes. */
function missingMetricHint(metric: FileMetricKey): string {
  const example = metric === 'coverage' ? ' (a cobertura depende do relatório de testes)' : '';
  return `Confira se o SonarCloud calcula ${metric} na análise${example}.`;
}

/**
 * Por que o repositório ficou sem distribuição (CA8). O Service devolve summary null em três casos: sem coleta por
 * arquivo na release (collected_at null), todos os arquivos com ncloc = 0 (excluded_files > 0) e coleta sem a
 * métrica pedida.
 */
export function getMissingDataMessage(
  { repository_name: name, collected_at: collectedAt, excluded_files: excludedFiles }: MetricDistributionRepository,
  metric: FileMetricKey,
  terms: RepositoryTerms
): StateMessage {
  if (collectedAt === null) {
    return {
      title: `Não há métricas por arquivo do ${terms.repository} ${name} nesta release`,
      description: `A última coleta deste ${terms.repository} não trouxe métricas do SonarQube por arquivo. ${NO_COLLECTION_HINT}`
    };
  }
  if (excludedFiles > 0) {
    const excluded = formatFileCount(excludedFiles);
    return {
      title: `Todos os arquivos do ${terms.repository} ${name} ficaram fora`,
      description:
        excludedFiles === 1
          ? `O único arquivo com ${metric} na última coleta não tem linhas de código (ncloc = 0) e fica fora, como no cálculo das medidas.`
          : `Os ${excluded} com ${metric} na última coleta não têm linhas de código (ncloc = 0) e ficam fora, como no cálculo das medidas.`
    };
  }
  return {
    title: `A última coleta do ${terms.repository} ${name} não trouxe ${metric} por arquivo`,
    description: missingMetricHint(metric)
  };
}

/** Estado vazio da comparação (CA8): nenhum repositório da release tem a métrica por arquivo. */
export function getComparisonMissingDataMessage(
  repositories: MetricDistributionRepository[],
  metric: FileMetricKey,
  terms: RepositoryTerms
): StateMessage {
  if (repositories.every((repository) => repository.collected_at === null)) {
    return {
      title: `Nenhum ${terms.repository} tem métricas por arquivo nesta release`,
      description: `A última coleta dos ${terms.repositories} não trouxe métricas do SonarQube por arquivo. ${NO_COLLECTION_HINT}`
    };
  }
  const collected = repositories.filter((repository) => repository.collected_at !== null);
  if (collected.every((repository) => repository.excluded_files > 0)) {
    return {
      title: `Todos os arquivos com ${metric} ficaram fora nesta release`,
      description: `Nos ${terms.repositories} com coleta, os arquivos com ${metric} não têm linhas de código (ncloc = 0) e ficam fora, como no cálculo das medidas.`
    };
  }
  const hint = missingMetricHint(metric);
  const title = `Nenhum ${terms.repository} tem ${metric} por arquivo nesta release`;
  if (collected.some((repository) => repository.excluded_files > 0)) {
    return {
      title,
      description: `A última coleta dos ${terms.repositories} não trouxe ${metric} por arquivo ou só trouxe arquivos sem linhas de código (ncloc = 0), que ficam fora. ${hint}`
    };
  }
  return {
    title,
    description: `A última coleta dos ${terms.repositories} não trouxe ${metric} por arquivo. ${hint}`
  };
}

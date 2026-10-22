import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DistributionSummary } from '@customTypes/product';

/** O que aparece no lugar de uma estatística que o Service devolve null. */
export const MISSING_STATISTIC = '—';

/** A assimetria precisa de pelo menos 3 análises (a mesma regra do DISTORÇÃO). */
export const MIN_ANALYSES_FOR_SKEWNESS = 3;

/**
 * Estatística com duas casas e vírgula (CA8); null vira "—". Um valor que arredonda para zero perde o sinal, senão
 * uma assimetria de −0,001 apareceria como "-0,00".
 */
export function formatStatistic(value: number | null): string {
  if (value === null) return MISSING_STATISTIC;
  const rounded = Math.abs(value) < 0.005 ? 0 : value;
  return rounded.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Contagem com separador de milhar: 1.284. */
export function formatCount(value: number): string {
  return value.toLocaleString('pt-BR');
}

export function formatAnalysisCount(count: number): string {
  return count === 1 ? '1 análise' : `${formatCount(count)} análises`;
}

export interface SummaryRow {
  label: string;
  value: string;
  /** O IQR fica destacado, como na referência. */
  highlight?: boolean;
}

/** Linhas do resumo estatístico (CA8), na ordem da referência; contagens sem casas e o resto com duas. */
export function getSummaryRows(summary: DistributionSummary): SummaryRow[] {
  return [
    { label: 'Análises', value: formatCount(summary.count) },
    { label: 'Mínimo', value: formatStatistic(summary.min) },
    { label: 'Q1 (1º quartil)', value: formatStatistic(summary.q1) },
    { label: 'Mediana', value: formatStatistic(summary.median) },
    { label: 'Q3 (3º quartil)', value: formatStatistic(summary.q3) },
    { label: 'Máximo', value: formatStatistic(summary.max) },
    { label: 'IQR (Q3 − Q1)', value: formatStatistic(summary.iqr), highlight: true },
    { label: 'Limite inferior', value: formatStatistic(summary.lower_limit) },
    { label: 'Limite superior', value: formatStatistic(summary.upper_limit) },
    { label: 'Discrepantes', value: formatCount(summary.outliers) },
    { label: 'Média', value: formatStatistic(summary.mean) },
    { label: 'Assimetria', value: formatStatistic(summary.skewness) }
  ];
}

/** O que o sinal da assimetria diz sobre as análises; null quando o Service não a calcula. */
export function describeSkewness(skewness: number | null): string | null {
  if (skewness === null) return null;
  const value = formatStatistic(skewness);
  if (value === formatStatistic(0)) {
    return 'Assimetria perto de zero: os valores se espalham por igual dos dois lados da mediana.';
  }
  if (skewness > 0) {
    return `Assimetria positiva (${value}): a cauda longa fica à direita, com valores altos isolados.`;
  }
  return `Assimetria negativa (${value}): a cauda longa fica à esquerda, com valores baixos isolados.`;
}

/**
 * Por que a assimetria ficou de fora (CA9): com menos de 3 análises, faltam análises; com 3 ou mais e o Service
 * devolvendo null, todas têm o mesmo valor (desvio zero). Null quando ela foi calculada.
 */
export function getSkewnessWarning({
  count,
  skewness
}: Pick<DistributionSummary, 'count' | 'skewness'>): string | null {
  if (count < MIN_ANALYSES_FOR_SKEWNESS) {
    return `Faltam análises para a assimetria: ela precisa de pelo menos ${MIN_ANALYSES_FOR_SKEWNESS}, e o período tem ${formatAnalysisCount(
      count
    )}.`;
  }
  if (skewness === null) return 'Sem assimetria: todas as análises do período têm o mesmo valor.';
  return null;
}

/** Período das análises (CA3): "17 ago a 16 out"; com o ano se as datas forem de anos diferentes; "17 ago" num dia só. */
export function formatPeriod(first: string, last: string): string {
  const start = new Date(first);
  const end = new Date(last);
  const pattern = start.getFullYear() === end.getFullYear() ? 'd MMM' : 'd MMM yyyy';
  const from = format(start, pattern, { locale: ptBR });
  const to = format(end, pattern, { locale: ptBR });
  return from === to ? from : `${from} a ${to}`;
}

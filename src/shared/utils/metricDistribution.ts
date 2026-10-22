import { DistributionAnalysis, DistributionSummary } from '@customTypes/product';

export interface BoxplotStats {
  /** Ponta da haste de baixo: o menor valor que não é discrepante, ou o Q1 se esse valor ficar acima dele. */
  low: number;
  q1: number;
  median: number;
  q3: number;
  /** Ponta da haste de cima: o maior valor que não é discrepante, ou o Q3 se esse valor ficar abaixo dele. */
  high: number;
  /** Do menor para o maior valor. */
  outliers: DistributionAnalysis[];
}

/**
 * Caixa e hastes de Tukey de uma entidade, para o boxplot do nível (TASK21.03.05). Os quartis vêm do resumo e os
 * discrepantes vêm marcados nas análises (is_outlier), as duas coisas calculadas pelo Service; as hastes vão até o
 * último valor dentro dos limites. Undefined sem análise, quando o resumo vem com os quartis null.
 */
export function getBoxplotStats(
  summary: DistributionSummary,
  analyses: DistributionAnalysis[]
): BoxplotStats | undefined {
  const { min, q1, median, q3, max } = summary;
  if (min === null || q1 === null || median === null || q3 === null || max === null) return undefined;

  const inliers = analyses.filter((analysis) => !analysis.is_outlier).map((analysis) => analysis.value);
  // reduce, e não Math.min(...valores): espalhar muitas análises nos argumentos estoura a pilha
  const minInlier = inliers.length ? inliers.reduce((result, value) => Math.min(result, value), Infinity) : min;
  const maxInlier = inliers.length ? inliers.reduce((result, value) => Math.max(result, value), -Infinity) : max;

  return {
    // com o quartil interpolado entre um discrepante e um valor comum, a haste pararia dentro da caixa: ela vai no
    // máximo até o quartil (a mesma regra do matplotlib)
    low: Math.min(minInlier, q1),
    q1,
    median,
    q3,
    high: Math.max(maxInlier, q3),
    outliers: analyses.filter((analysis) => analysis.is_outlier).sort((a, b) => a.value - b.value)
  };
}

export interface OutlierGroup {
  /** Onde o ponto é desenhado: no meio entre o menor e o maior valor do grupo. */
  value: number;
  analyses: DistributionAnalysis[];
}

/** Onde o grupo é desenhado: no meio entre o menor e o maior valor. */
function groupCenter(analyses: DistributionAnalysis[]): number {
  return (analyses[0].value + analyses[analyses.length - 1].value) / 2;
}

/**
 * Junta os discrepantes (em ordem crescente) que cairiam no mesmo ponto do gráfico: valores iguais ou a até
 * `tolerance` do centro do grupo, onde o ponto é desenhado. Assim dois pontos vizinhos ficam a mais de `tolerance`.
 * Sem isso, só o ponto de cima recebe o mouse e as outras análises ficam escondidas.
 */
export function groupOutliers(outliers: DistributionAnalysis[], tolerance = 0): OutlierGroup[] {
  const groups = outliers.reduce<DistributionAnalysis[][]>((result, analysis) => {
    const current = result[result.length - 1];
    if (current && analysis.value - groupCenter(current) <= tolerance) current.push(analysis);
    else result.push([analysis]);
    return result;
  }, []);
  return groups.map((group) => ({ value: groupCenter(group), analyses: group }));
}

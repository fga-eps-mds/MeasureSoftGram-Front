import { DistributionAnalysis, DistributionSummary } from '@customTypes/product';
import { getBoxplotStats, groupOutliers } from '../metricDistribution';

function analyses(values: number[], outliers: number[] = []): DistributionAnalysis[] {
  return values.map((value, index) => ({
    date: `2026-08-${String(index + 1).padStart(2, '0')}T10:00:00-03:00`,
    value,
    is_outlier: outliers.includes(value)
  }));
}

function summary(values: Partial<DistributionSummary>): DistributionSummary {
  return {
    count: 0,
    min: null,
    p10: null,
    q1: null,
    median: null,
    q3: null,
    p90: null,
    max: null,
    iqr: null,
    lower_limit: null,
    upper_limit: null,
    outliers: 0,
    mean: null,
    skewness: null,
    ...values
  };
}

// q1, mediana e q3 de [1..8, 30] pelo método inclusive, como o Service calcula; o 30 passa do limite superior (13)
const base = summary({ count: 9, min: 1, q1: 3, median: 5, q3: 7, max: 30, lower_limit: -3, upper_limit: 13 });

describe('getBoxplotStats', () => {
  it('usa os discrepantes marcados pelo Service e leva as hastes até o último valor dentro dos limites', () => {
    expect(getBoxplotStats(base, analyses([1, 2, 3, 4, 5, 6, 7, 8, 30], [30]))).toEqual({
      low: 1,
      q1: 3,
      median: 5,
      q3: 7,
      high: 8,
      outliers: [{ date: '2026-08-09T10:00:00-03:00', value: 30, is_outlier: true }]
    });
  });

  it('ordena os discrepantes do menor para o maior', () => {
    const stats = getBoxplotStats(base, analyses([40, -10, 1, 2, 3, 4, 5, 6, 7, 8], [40, -10]));

    expect(stats?.outliers.map((analysis) => analysis.value)).toEqual([-10, 40]);
  });

  it('sem análises na lista, usa o mínimo e o máximo do resumo nas hastes', () => {
    expect(getBoxplotStats(base, [])).toMatchObject({ low: 1, high: 30, outliers: [] });
  });

  it('não deixa a haste de baixo entrar na caixa', () => {
    // [0, 0, 1 × 6]: q1 = 0,75 pelo método inclusive e os dois zeros são discrepantes
    const coverage = summary({ count: 8, min: 0, q1: 0.75, median: 1, q3: 1, max: 1 });

    expect(getBoxplotStats(coverage, analyses([0, 0, 1, 1, 1, 1, 1, 1], [0]))).toMatchObject({ low: 0.75, high: 1 });
  });

  it('não deixa a haste de cima entrar na caixa', () => {
    // [1 × 6, 50, 50]: q3 = 13,25 pelo método inclusive e os dois 50 são discrepantes
    const issues = summary({ count: 8, min: 1, q1: 1, median: 1, q3: 13.25, max: 50 });

    expect(getBoxplotStats(issues, analyses([1, 1, 1, 1, 1, 1, 50, 50], [50]))).toMatchObject({ low: 1, high: 13.25 });
  });

  it('sem análise (quartis null), não tem caixa', () => {
    expect(getBoxplotStats(summary({}), [])).toBeUndefined();
  });
});

describe('groupOutliers', () => {
  it('junta as análises com o mesmo valor num ponto só', () => {
    const groups = groupOutliers(analyses([30, 30, 40], [30, 40]));

    expect(groups.map((group) => [group.value, group.analyses.length])).toEqual([
      [30, 2],
      [40, 1]
    ]);
  });

  it('junta os valores próximos dentro da tolerância e põe o ponto no meio deles', () => {
    const groups = groupOutliers(analyses([0.1, 0.3, 5]), 1.5);

    expect(groups.map((group) => [group.value, group.analyses.length])).toEqual([
      [0.2, 2],
      [5, 1]
    ]);
  });
});

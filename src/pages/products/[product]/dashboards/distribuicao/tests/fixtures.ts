import {
  FileMetricKey,
  IReleases,
  MetricDistribution,
  MetricDistributionFile,
  MetricDistributionReference,
  MetricDistributionRepository,
  MetricDistributionSummary
} from '@customTypes/product';

export const releases: IReleases[] = [
  {
    id: 1,
    release_name: '2026.2 R1',
    start_at: '2026-01-01T00:00:00-03:00',
    end_at: '2026-01-31T00:00:00-03:00',
    created_by: 'user',
    product: 2
  },
  {
    id: 2,
    release_name: '2026.2 R2',
    start_at: '2026-02-01T00:00:00-03:00',
    end_at: '2099-12-31T00:00:00-03:00',
    created_by: 'user',
    product: 2
  }
];

// q1, mediana e q3 de [1..8, 30] pelo método inclusive, como o Service calcula
export const summary: MetricDistributionSummary = {
  count: 9,
  min: 1,
  q1: 3,
  median: 5,
  q3: 7,
  max: 30,
  mean: 7.33,
  std_dev: 8.3
};

export const files: MetricDistributionFile[] = [1, 2, 3, 4, 5, 6, 7, 8]
  .map((value) => ({ path: `src/arquivo_${value}.py`, value }))
  .concat({ path: 'src/apps/analytics/views/release_report.py', value: 30 });

function repository(
  id: number,
  name: string,
  overrides: Partial<MetricDistributionRepository> = {}
): MetricDistributionRepository {
  return {
    repository_id: id,
    repository_name: name,
    collected_at: '2026-10-14T21:03:11-03:00',
    excluded_files: 2,
    summary,
    ...overrides
  };
}

/** Repositórios como vêm sem repository_id: com o resumo e sem os arquivos, em ordem de nome. */
export const action = repository(11, 'action', { collected_at: null, excluded_files: 0, summary: null });
export const front = repository(9, 'front', { summary: { ...summary, count: 5, median: 4 } });
export const service = repository(7, 'service');

/** O mesmo repositório como vem com repository_id: com os arquivos. */
export function withFiles(item: MetricDistributionRepository): MetricDistributionRepository {
  return { ...item, files: item.summary ? files : [] };
}

export const commentsReference: MetricDistributionReference = {
  measure: 'commented_file_density',
  min_threshold: 10,
  max_threshold: 30
};

export function distribution(
  repositories: MetricDistributionRepository[],
  reference: MetricDistributionReference | null = null,
  metric: FileMetricKey = 'complexity',
  releaseId = 2
): MetricDistribution {
  return {
    release: { id: releaseId, release_name: '2026.2 R2', start_at: '', end_at: '' },
    metric,
    reference,
    repositories
  };
}

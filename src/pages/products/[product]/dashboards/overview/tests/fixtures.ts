import {
  ReleaseDashboardCharacteristics,
  ReleaseDashboardRepository,
  ReleaseDashboardSummary
} from '@customTypes/product';

export const releases = [
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

export function summary(releaseId = 2): ReleaseDashboardSummary {
  return {
    release: { id: releaseId, release_name: `R${releaseId}`, start_at: '', end_at: '' },
    totals: { characteristics: 3, subcharacteristics: 6, measures: 10, metrics: 14, repositories: 2, files: 1284 }
  };
}

function repository(
  id: number,
  name: string,
  tsqmi: number | null,
  values: Record<string, number | null>
): ReleaseDashboardRepository {
  return {
    id,
    name,
    tsqmi: { value: tsqmi, created_at: null },
    characteristics: Object.entries(values).map(([key, value]) => ({ key, value, created_at: null }))
  };
}

export function characteristics(
  repositories: ReleaseDashboardRepository[] = [
    repository(7, 'service', 0.81, { reliability: 0.74, maintainability: 0.78 }),
    repository(9, 'front', 0.72, { reliability: 0.7, maintainability: null })
  ]
): ReleaseDashboardCharacteristics {
  return {
    release: { id: 2, release_name: '2026.2 R2', start_at: '', end_at: '' },
    characteristics: [
      { key: 'reliability', name: 'Reliability', planned: 0.7, accomplished: 0.72, dispersion: 0.02 },
      { key: 'maintainability', name: 'Maintainability', planned: 0.8, accomplished: 0.78, dispersion: 0 }
    ],
    repositories
  };
}

export const repositoryWithoutAnalysis = repository(11, 'docs', null, { reliability: null, maintainability: null });

export const previousCharacteristics = characteristics([
  repository(9, 'front', 0.75, { reliability: 0.7, maintainability: 0.7 })
]);

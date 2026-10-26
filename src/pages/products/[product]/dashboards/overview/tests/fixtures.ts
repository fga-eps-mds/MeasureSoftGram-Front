import {
  AccomplishedRepository,
  IReleasesWithGoalAndAccomplished,
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

function repository(id: number, name: string, tsqmi: number | null): ReleaseDashboardRepository {
  return { id, name, tsqmi: { value: tsqmi, created_at: null } };
}

/** release-dashboard/characteristics: o Indicador Total da Qualidade de cada repositório. */
export function characteristics(
  repositories: ReleaseDashboardRepository[] = [repository(7, 'service', 0.81), repository(9, 'front', 0.72)]
): ReleaseDashboardCharacteristics {
  return { release: { id: 2, release_name: '2026.2 R2', start_at: '', end_at: '' }, repositories };
}

export const previousCharacteristics = characteristics([repository(9, 'front', 0.75)]);

function accomplished(name: string, values: Record<string, number | null>, normDiff: number): AccomplishedRepository {
  return {
    repository_name: name,
    norm_diff: normDiff,
    characteristics: Object.entries(values).map(([key, value]) => ({ name: key, value: value as number, diff: 0 }))
  };
}

/** analysis_data da release: o mesmo do equalizador da tela da release. */
export function analysis(
  repositories: AccomplishedRepository[] = [
    accomplished('service', { reliability: 0.74, maintainability: 0.78 }, 0.05),
    accomplished('front', { reliability: 0.7, maintainability: null }, 0.2)
  ]
): IReleasesWithGoalAndAccomplished {
  return {
    release: releases[1],
    planned: [
      { name: 'reliability', value: 0.7, diff: 0 },
      { name: 'maintainability', value: 0.8, diff: 0 }
    ],
    accomplished: repositories
  };
}

export const repositoryWithoutAnalysis = accomplished('docs', { reliability: null, maintainability: null }, 0);

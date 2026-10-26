import { CorrelationLevel, RepositoryCorrelation } from '@customTypes/product';

export const repositories = [
  { id: 10, name: 'MeasureSoftGram-Service' },
  { id: 11, name: 'MeasureSoftGram-Front' }
];

const releases = Array.from({ length: 20 }, (_, index) => ({
  id: index + 1,
  release_name: `R${index + 1}`,
  start_at: '2026-01-05T00:00:00-03:00',
  end_at: '2026-01-11T00:00:00-03:00'
}));

/**
 * Resposta do Service com as colunas C1, C3 e C6 do Exemplo 7 do modelo matemático (20 releases, Spearman), mais um
 * par não significativo e um sem variação no nível subcaracterística.
 */
export function correlation({
  repositoryId = 10,
  level = 'characteristic',
  ...fields
}: { repositoryId?: number; level?: CorrelationLevel } & Partial<RepositoryCorrelation> = {}): RepositoryCorrelation {
  const repository = repositories.find((item) => item.id === repositoryId) ?? repositories[0];
  return {
    repository,
    level,
    entities: [
      { key: 'reliability', name: 'Reliability' },
      { key: 'maintainability', name: 'Maintainability' },
      { key: 'functional_suitability', name: 'Functional Suitability' }
    ],
    releases,
    excluded_releases: 0,
    method: 'spearman',
    non_normal: 3,
    critical_value: 0.4438,
    pairs: [
      { row: 'maintainability', column: 'reliability', coefficient: 0.559, p_value: 0.0104, significant: true },
      { row: 'functional_suitability', column: 'reliability', coefficient: -0.32, p_value: 0.17, significant: false },
      {
        row: 'functional_suitability',
        column: 'maintainability',
        coefficient: 0.9282,
        p_value: 3.7e-9,
        significant: true
      }
    ],
    reason: null,
    ...fields
  };
}

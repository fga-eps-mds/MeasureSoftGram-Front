import { EntityMatrix, EntityMatrixColumn, EntityMatrixRepository } from '@customTypes/product';

const reliability = { level: 'characteristic' as const, key: 'reliability', name: 'Reliability', weight: 34 };
const maintainability = {
  level: 'characteristic' as const,
  key: 'maintainability',
  name: 'Maintainability',
  weight: 33
};
const testingStatus = {
  level: 'subcharacteristic' as const,
  key: 'testing_status',
  name: 'Testing Status',
  weight: 50
};
const maturity = { level: 'subcharacteristic' as const, key: 'maturity', name: 'Maturity', weight: 50 };
const modifiability = { level: 'subcharacteristic' as const, key: 'modifiability', name: 'Modifiability', weight: 100 };

export const measureColumns: EntityMatrixColumn[] = [
  { key: 'passed_tests', name: 'Passed Tests', weight: 33, path: [reliability, testingStatus] },
  { key: 'test_coverage', name: 'Test Coverage', weight: 34, path: [reliability, testingStatus] },
  { key: 'ci_feedback_time', name: 'CI Feedback Time', weight: 100, path: [reliability, maturity] },
  { key: 'commented_file_density', name: 'Commented File Density', weight: 25, path: [maintainability, modifiability] }
];

type Cell = [value: number | null, previous: number | null, contribution: number | null];

export function repository(
  id: number,
  name: string,
  tsqmi: [number | null, number | null],
  cells: Record<string, Cell>
): EntityMatrixRepository {
  return {
    id,
    name,
    tsqmi: { value: tsqmi[0], previous_value: tsqmi[1] },
    cells: Object.entries(cells).map(([key, [value, previousValue, contribution]]) => ({
      key,
      value,
      previous_value: previousValue,
      contribution
    }))
  };
}

/** Três repositórios no nível medida, na R2, com a R1 como release anterior. */
export function measureMatrix(overrides: Partial<EntityMatrix> = {}): EntityMatrix {
  return {
    release: { id: 2, release_name: 'R2', start_at: '2026-03-01T00:00:00-03:00', end_at: '2026-03-31T00:00:00-03:00' },
    previous_release: {
      id: 1,
      release_name: 'R1',
      start_at: '2026-02-01T00:00:00-03:00',
      end_at: '2026-02-28T00:00:00-03:00'
    },
    level: 'measure',
    columns: measureColumns,
    repositories: [
      repository(1, 'Service', [0.67, 0.7], {
        passed_tests: [0.99, 0.99, 0],
        test_coverage: [0.81, 0.85, -0.004],
        ci_feedback_time: [0.78, 0.8, -0.002],
        commented_file_density: [0.5, 0.48, 0.003]
      }),
      repository(2, 'AI', [0.41, 0.5], {
        passed_tests: [0.74, 0.7, 0.005],
        test_coverage: [0.18, 0.47, -0.017],
        ci_feedback_time: [0.35, 0.4, -0.008],
        commented_file_density: [0.3, 0.41, -0.012]
      }),
      repository(3, 'Front', [0.53, 0.6], {
        passed_tests: [0.91, 0.9, 0.001],
        test_coverage: [0.32, 0.68, -0.021],
        ci_feedback_time: [null, null, null],
        commented_file_density: [0.22, 0.24, -0.002]
      })
    ],
    ...overrides
  };
}

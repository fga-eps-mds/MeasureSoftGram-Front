import { QualityModelNode, QualityModelNodeType } from '@customTypes/metamodel';
import {
  AnalysisDistribution,
  DistributionEntity,
  DistributionLevel,
  DistributionSummary,
  EntityAnalysisCatalog,
  IReleases,
  ReleaseDashboardCharacteristics,
  ReleaseDashboardRepository
} from '@customTypes/product';

export const releases: IReleases[] = [
  {
    id: 1,
    release_name: 'R1',
    start_at: '2026-06-01T00:00:00-03:00',
    end_at: '2026-08-16T00:00:00-03:00',
    created_by: 'user',
    product: 2
  },
  {
    id: 2,
    release_name: 'R2',
    start_at: '2026-08-17T00:00:00-03:00',
    end_at: '2026-10-16T00:00:00-03:00',
    created_by: 'user',
    product: 2
  }
];

function repository(id: number, name: string, tsqmi: number | null): ReleaseDashboardRepository {
  return {
    id,
    name,
    tsqmi: { value: tsqmi, created_at: tsqmi === null ? null : '2026-10-16T18:40:00-03:00' },
    characteristics: []
  };
}

// o Action vem primeiro na lista, mas não tem análise na release: a página abre no Service
export const action = repository(11, 'MeasureSoftGram-Action', null);
export const service = repository(7, 'MeasureSoftGram-Service', 0.62);
export const front = repository(9, 'MeasureSoftGram-Front', 0.58);

export function releaseRepositories(
  repositories: ReleaseDashboardRepository[],
  releaseId = 2
): ReleaseDashboardCharacteristics {
  const release = releases.find((item) => item.id === releaseId) ?? releases[1];
  return {
    release: {
      id: release.id,
      release_name: release.release_name,
      start_at: String(release.start_at),
      end_at: String(release.end_at)
    },
    characteristics: [],
    repositories
  };
}

function node(
  type: QualityModelNodeType,
  key: string,
  name: string,
  children: QualityModelNode[] = []
): QualityModelNode {
  return { id: null, type, key, name, description: null, weight: null, children };
}

export const tree: QualityModelNode[] = [
  node('tsqmi', 'tsqmi', 'TSQMI', [
    node('characteristic', 'reliability', 'Reliability', [
      node('subcharacteristic', 'testing_status', 'Testing Status', [
        node('measure', 'passed_tests', 'Passed Tests', [node('metric', 'tests', 'tests')]),
        node('measure', 'ci_feedback_time', 'CI Feedback Time', [
          node('metric', 'sum_ci_feedback_times', 'sum_ci_feedback_times'),
          node('metric', 'total_builds', 'total_builds')
        ])
      ])
    ]),
    node('characteristic', 'maintainability', 'Maintainability', [
      node('subcharacteristic', 'modifiability', 'Modifiability', [
        node('measure', 'non_complex_file_density', 'Non Complex File Density', [
          node('metric', 'complexity', 'complexity')
        ])
      ])
    ]),
    node('characteristic', 'functional_suitability', 'Functional Suitability', [
      node('subcharacteristic', 'functional_completeness', 'Functional Completeness', [
        node('measure', 'team_throughput', 'Team Throughput', [
          node('metric', 'resolved_issues', 'resolved_issues'),
          node('metric', 'total_issues', 'total_issues')
        ])
      ])
    ])
  ])
];

/** As métricas do GitHub, gravadas com qualifier TRK. */
export const catalog: EntityAnalysisCatalog = {
  characteristic: [],
  subcharacteristic: [],
  measure: [],
  metric: ['sum_ci_feedback_times', 'total_builds', 'resolved_issues', 'total_issues'].map((key) => ({
    key,
    name: key
  }))
};

export const summary: DistributionSummary = {
  count: 6,
  min: 0.31,
  p10: 0.385,
  q1: 0.5125,
  median: 0.555,
  q3: 0.6,
  p90: 0.75,
  max: 0.9,
  iqr: 0.0875,
  lower_limit: 0.38125,
  upper_limit: 0.73125,
  outliers: 2,
  mean: 0.5716666,
  skewness: 0.48
};

export const emptySummary: DistributionSummary = {
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
  skewness: null
};

const VALUES = [0.31, 0.52, 0.55, 0.56, 0.6, 0.9];

export function entity(
  key: string,
  name: string,
  level: DistributionLevel,
  values: number[] = VALUES,
  metricType: string | null = null
): DistributionEntity {
  return {
    key,
    name,
    level,
    metric_type: metricType,
    analyses: values.map((value, index) => ({
      date: `2026-08-${String(17 + index).padStart(2, '0')}T10:00:00-03:00`,
      value,
      is_outlier: value === 0.31 || value === 0.9
    })),
    summary: values.length ? summary : emptySummary
  };
}

/** Resposta do analysis-distribution, como o Service devolve. */
export function distribution({
  releaseId = 2,
  repositoryId = service.id,
  level = 'tsqmi',
  key = 'tsqmi',
  main = entity('tsqmi', 'TSQMI', 'tsqmi'),
  children = [entity('reliability', 'Reliability', 'characteristic')]
}: {
  releaseId?: number;
  repositoryId?: number;
  level?: DistributionLevel;
  key?: string;
  main?: DistributionEntity;
  children?: DistributionEntity[];
} = {}): AnalysisDistribution {
  // uma release fora da lista é de outro produto
  const release = { ...releaseRepositories([], releaseId).release, id: releaseId };
  const name = [action, service, front].find((item) => item.id === repositoryId)?.name ?? 'outro';
  const count = main.analyses.length;
  return {
    release,
    repository: { id: repositoryId, name },
    level,
    key,
    period: {
      count,
      first: count ? main.analyses[0].date : null,
      last: count ? main.analyses[count - 1].date : null
    },
    entity: main,
    children
  };
}

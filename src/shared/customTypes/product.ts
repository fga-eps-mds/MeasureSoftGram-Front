import { ButtonProps } from '@mui/material';

export interface CollectedMeasure {
  id: number;
  measure_id: number;
  value: number;
  created_at: string;
}

export interface MeasuresHistoryResult {
  id: number;
  key: string;
  name: string;
  description: string;
  history: Array<CollectedMeasure>;
}

export interface MeasuresHistory {
  count: string;
  next: string;
  previous: string;
  results: Array<MeasuresHistoryResult>;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  github_url: string;
  created_at: string;
  updated_at: string;
  gaugeRedLimit: number;
  gaugeYellowLimit: number;
}

interface DefaultAttr {
  id: number;
  key: string;
  name: string;
  description: string | null;
}

interface PreConfigSubCharacteristics extends DefaultAttr {
  measures: Array<DefaultAttr>;
}

interface PreConfigCharacteristics extends DefaultAttr {
  subcharacteristics: Array<PreConfigSubCharacteristics>;
}

export interface CurrentPreConfig {
  id: number;
  name: string;
  created_at: string;
  data: {
    characteristics: Array<PreConfigCharacteristics>;
  };
}

export interface DefaultPreConfig {
  characteristics: Array<PreConfigCharacteristics>;
}

export interface PreConfigEntitiesRelationship extends DefaultAttr {
  subcharacteristics: Array<PreConfigSubCharacteristics>;
}

export interface CharacteristicWithBalanceMatrix {
  id: number;
  key: string;
  value: number;
  correlations: {
    '+': string[];
    '-': string[];
  };
}

export interface ValuesCommitted {
  [key: string]: number;
}

export interface Changes {
  characteristic_key: keyof ValuesCommitted;
  delta: number;
}

export interface ButtonType extends Omit<Partial<ButtonProps>, 'color'> {
  label: string;
  onClick: () => void;
  backgroundColor: string;
  color: string;
  variant?: ButtonProps['variant'];
  hover?: string;
  dataTestId?: string;
}

export interface TsqmiValue {
  id: number;
  value: number;
  created_at: string;
}

export interface Repositories {
  id: number;
  url: string;
  name: string;
  key: string;
  description: string;
  product: string;
}

interface RepositoriesTsqmiHistoryResult {
  history: Array<TsqmiValue>;
}

export interface RepositoriesTsqmiHistory {
  count: number;
  results: Array<RepositoriesTsqmiHistoryResult & Repositories>;
}

interface RepositoriesTsqmiLatestResult {
  current_tsqmi: TsqmiValue;
}

export interface RepositoriesLatestTsqmi {
  count: number;
  results: Array<RepositoriesTsqmiLatestResult & Repositories>;
}

export interface CollectedMetric {
  id: number;
  metric_id: number;
  value: number;
  created_at: string;
}

export interface EntitiesMetricsResult {
  id: number;
  key: string;
  name: string;
  description: string;
  latest: Array<CollectedMetric>;
}

export interface EntitiesMetrics {
  count: string;
  next: string;
  previous: string;
  results: Array<MeasuresHistoryResult>;
}

export interface LatestValuesInfos {
  id: number;
  value: number;
  created_at: string;
}

export interface LatestValuesResult {
  id: number;
  key: string;
  name: string;
  description: string;
  latest: Array<LatestValuesInfos>;
}

export interface LatestValues {
  count: string;
  next: string;
  previous: string;
  results: Array<LatestValuesResult>;
}

export interface Characteristics {
  reliability?: number;
  maintainability?: number;
}

export interface Goal {
  id: number;
  release_name: string;
  start_at: Date | string;
  end_at: Date | string;
  data: Characteristics;
}

export interface Change {
  characteristic_key: string;
  delta: number;
}

export interface ReleaseGoal {
  changes: Change[];
  allow_dynamic: boolean;
}

export interface IReleases {
  id: number;
  release_name: string;
  start_at: Date | string;
  end_at: Date | string;
  created_by: string;
  product: number;
  goal?: number;
  description?: string;
}

export interface ReleasesPaginated {
  count?: number;
  next?: number;
  previous?: number;
  results?: IReleases[];
}

export interface Characteristic {
  name: string;
  value: number;
  diff: number;
}

export interface AccomplishedRepository {
  repository_name: string;
  characteristics: Characteristic[];
  norm_diff?: number;
}

export interface IReleasesWithGoalAndAccomplished {
  release: IReleases;
  planned: Characteristic[];
  accomplished?: AccomplishedRepository[];
}

export interface HistoryDateRange {
  startDate: number | null;
  endDate: number | null;
}

export type EntityLevel = 'characteristic' | 'subcharacteristic' | 'measure' | 'metric';

export interface EntityAnalysisEntity {
  key: string;
  name: string;
}

export type EntityAnalysisCatalog = Record<EntityLevel, EntityAnalysisEntity[]>;

export interface EntityAnalysisValue {
  value: number | null;
  created_at: string | null;
}

export interface EntityAnalysisChild extends EntityAnalysisValue {
  key: string;
  name: string;
  weight: number | null;
}

export interface EntityAnalysisRepository extends EntityAnalysisValue {
  id: number;
  name: string;
  children: EntityAnalysisChild[];
}

export interface EntityAnalysisReference {
  goal?: number;
  min_threshold?: number;
  max_threshold?: number;
}

export interface EntityAnalysis {
  release: Pick<IReleases, 'id' | 'release_name' | 'start_at' | 'end_at'>;
  level: EntityLevel;
  entity: EntityAnalysisEntity & { metric_type?: string };
  reference: EntityAnalysisReference | null;
  repositories: EntityAnalysisRepository[];
}

/** Valor de uma entidade numa release: o último calculado dentro da janela dela (null sem análise). */
export interface ReleaseValue {
  value: number | null;
  created_at: string | null;
}

export interface ReleaseDashboardRelease {
  id: number;
  release_name: string;
  start_at: string;
  end_at: string;
}

/** GET products/{id}/release-dashboard/summary/?release_id= (Service, US07.01) */
export interface ReleaseDashboardSummary {
  release: ReleaseDashboardRelease;
  totals: {
    characteristics: number;
    subcharacteristics: number;
    measures: number;
    metrics: number;
    repositories: number;
    files: number;
  };
}

export interface ReleaseDashboardCharacteristic {
  key: string;
  name: string;
  /** Meta da release, de 0 a 1; null quando a release não tem meta para a característica. */
  planned: number | null;
  /** Média entre os repositórios com valor; null quando nenhum tem valor. */
  accomplished: number | null;
  /** Desvio padrão entre os repositórios com valor. */
  dispersion: number | null;
}

export interface ReleaseDashboardRepository {
  id: number;
  name: string;
  tsqmi: ReleaseValue;
  characteristics: Array<ReleaseValue & { key: string }>;
}

/** GET products/{id}/release-dashboard/characteristics/?release_id= (Service, US07.01) */
export interface ReleaseDashboardCharacteristics {
  release: ReleaseDashboardRelease;
  characteristics: ReleaseDashboardCharacteristic[];
  repositories: ReleaseDashboardRepository[];
}

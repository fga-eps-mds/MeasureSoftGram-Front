import type { ButtonProps } from '@mui/material/Button';

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

/** Níveis do mapa de calor da Análise por Entidade: as métricas não têm valor de 0 a 1 nem grau. */
export type EntityMatrixLevel = Exclude<EntityLevel, 'metric'>;

export interface EntityMatrixEntity {
  key: string;
  name: string;
  /** Peso na configuração da release, dentro da entidade de cima. */
  weight: number | null;
}

export interface EntityMatrixColumn extends EntityMatrixEntity {
  /** As entidades de cima, da característica até o pai. */
  path: Array<EntityMatrixEntity & { level: EntityLevel }>;
}

export interface EntityMatrixValue {
  value: number | null;
  /** Valor na release anterior; null na primeira release ou sem valor nela. */
  previous_value: number | null;
}

export interface EntityMatrixCell extends EntityMatrixValue {
  key: string;
  /** Quanto a entidade fez o TSQMI do repositório subir ou descer desde a release anterior. */
  contribution: number | null;
}

export interface EntityMatrixRepository {
  id: number;
  name: string;
  tsqmi: EntityMatrixValue;
  cells: EntityMatrixCell[];
}

/** GET products/{id}/entity-analysis/matrix/?release_id=&level= (Service, US21.02) */
export interface EntityMatrix {
  release: ReleaseDashboardRelease;
  previous_release: ReleaseDashboardRelease | null;
  level: EntityMatrixLevel;
  columns: EntityMatrixColumn[];
  repositories: EntityMatrixRepository[];
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

export interface ReleaseDashboardRepository {
  id: number;
  name: string;
  /** Indicador Total da Qualidade (TSQMI) do repositório na release. */
  tsqmi: ReleaseValue;
}

/**
 * GET products/{id}/release-dashboard/characteristics/?release_id= (Service, US07.01): o Indicador Total da Qualidade
 * de cada repositório na release. O planejado × realizado e o radar usam o analysis_data da release.
 */
export interface ReleaseDashboardCharacteristics {
  release: ReleaseDashboardRelease;
  repositories: ReleaseDashboardRepository[];
}

/** Níveis do modelo na Distribuição Estatística: o TSQMI e os da Análise por Entidade. */
export type DistributionLevel = 'tsqmi' | EntityLevel;

/** Uma execução da coleta (Action ou CLI) no repositório, dentro da release. */
export interface DistributionAnalysis {
  date: string;
  value: number;
  /** Fora dos limites Q1 − 1,5 × IQR e Q3 + 1,5 × IQR, pelo Service. */
  is_outlier: boolean;
}

/**
 * Resumo calculado pelo Service, sem arredondamento: quartis e percentis pelo método inclusive (QUARTIL.INC) e
 * assimetria amostral ajustada (DISTORÇÃO). Sem análise, count e outliers vêm 0 e o resto vem null; a assimetria
 * também vem null com menos de 3 análises ou com desvio zero.
 */
export interface DistributionSummary {
  count: number;
  min: number | null;
  p10: number | null;
  q1: number | null;
  median: number | null;
  q3: number | null;
  p90: number | null;
  max: number | null;
  iqr: number | null;
  lower_limit: number | null;
  upper_limit: number | null;
  outliers: number;
  mean: number | null;
  skewness: number | null;
}

export interface DistributionEntity {
  key: string;
  name: string;
  level: DistributionLevel;
  /** Só no nível métrica (INT, FLOAT, PERCENT…). */
  metric_type: string | null;
  /** Em ordem de data. */
  analyses: DistributionAnalysis[];
  summary: DistributionSummary;
}

/** GET products/{id}/analysis-distribution/?release_id=&repository_id=&level=&key= (Service, US21.03) */
export interface AnalysisDistribution {
  release: ReleaseDashboardRelease;
  repository: { id: number; name: string };
  level: DistributionLevel;
  key: string;
  /** Quantidade de análises da entidade e as datas da primeira e da última (null sem análise). */
  period: { count: number; first: string | null; last: string | null };
  entity: DistributionEntity;
  /** Filhos com análise na release, na ordem da configuração; vazio no nível métrica. */
  children: DistributionEntity[];
}

/** Níveis da correlação (US21.04): as características ou as subcaracterísticas. */
export type CorrelationLevel = 'characteristic' | 'subcharacteristic';

/** Um par do triângulo de baixo da matriz: a entidade da linha com uma das que vêm antes dela. */
export interface CorrelationPair {
  row: string;
  column: string;
  /** null quando uma das entidades não variou entre as releases. */
  coefficient: number | null;
  p_value: number | null;
  /** p < 0,05. */
  significant: boolean;
}

/**
 * GET products/{id}/correlation/?repository_id=&level= (Service, US21.04): RD_Corr, a correlação entre as entidades
 * do nível ao longo das releases do repositório, pela função f_sigma do Core.
 */
export interface RepositoryCorrelation {
  repository: { id: number; name: string };
  level: CorrelationLevel;
  /** Entidades da configuração da release mais recente, na ordem dela. */
  entities: Array<{ key: string; name: string }>;
  /** Linhas de RD: as releases com valor para todas as entidades, da mais antiga para a mais nova. */
  releases: ReleaseDashboardRelease[];
  /** Releases do repositório deixadas de fora por falta de valor. */
  excluded_releases: number;
  /** null quando não há pares (reason preenchido). */
  method: 'pearson' | 'spearman' | null;
  /** Colunas de RD sem distribuição normal. */
  non_normal: number | null;
  /** |r| a partir do qual o coeficiente é significativo com o número de releases usadas. */
  critical_value: number | null;
  pairs: CorrelationPair[];
  reason: 'insufficient_releases' | 'insufficient_entities' | null;
}

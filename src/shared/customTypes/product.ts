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

export interface ReleaseGoal {
  id: number;
  release_name: string;
  start_at: string;
  end_at: string;
  changes: Changes[];
  allow_dynamic: boolean;
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

interface TsqmiValue {
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

export interface IReleasesWithGoalAndAccomplished {
  release: IReleases;
  planned: Characteristics;
  accomplished?: Characteristics;
}

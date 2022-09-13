import { ButtonProps } from '@mui/material';

export interface CollectedMetric {
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
  history: Array<CollectedMetric>;
}

export interface MeasuresHistory {
  count: string;
  next: string;
  previous: string;
  results: Array<MeasuresHistoryResult>;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  github_url: string;
  created_at: string;
  updated_at: string;
}

interface DefaultAttr {
  key: string;
  weight: number;
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
  release_name: string;
  start_at: string;
  end_at: string;
  changes: Changes[];
}

export interface ButtonType extends Omit<Partial<ButtonProps>, 'color'> {
  label: string;
  onClick: () => void;
  backgroundColor: string;
  color: string;
  variant?: ButtonProps['variant'];
}

interface SqcValue {
  id: number;
  value: number;
  created_at: string;
}

interface RepositoriesSqcHistoryResult {
  id: number;
  url: string;
  name: string;
  history: Array<SqcValue>;
}

export interface RepositoriesSqcHistory {
  count: number;
  results: Array<RepositoriesSqcHistoryResult>;
}

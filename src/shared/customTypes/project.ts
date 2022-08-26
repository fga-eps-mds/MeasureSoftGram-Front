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

export interface Project {
  id: number;
  name: string;
  description: string;
  github_url: string;
  created_at: string;
  updated_at: string;
}

export interface ButtonType extends Omit<Partial<ButtonProps>, 'color'> {
  label: string;
  onClick: () => void;
  backgroundColor: string;
  color: string;
  variant?: ButtonProps['variant'];
}

interface CollectedMetric {
  id: number;
  measure_id: number;
  value: number;
  created_at: string;
}

export interface MeasuresHistoryResult {
  id: number,
  key: string,
  name: string,
  description: string,
  collected_metric_history: Array<CollectedMetric>
}

export interface MeasuresHistory {
  count: string;
  next: string;
	previous: string;
	results: Array<MeasuresHistoryResult>
}

export interface Project {
  id: number;
  name: string;
  description: string;
  github_url: string;
  created_at: string;
  updated_at: string;
}

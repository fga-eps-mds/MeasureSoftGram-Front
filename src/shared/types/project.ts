interface CollectedMetric {
  id: number;
  measure_id: number;
  value: number;
  created_at: string;
}

interface MeasuresHistoryResult {
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

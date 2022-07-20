export interface MeasureResult {
  id: number;
  key: string;
  name: string;
  description: string;
  latest: {
    id: number;
    measure_id: number;
    value: number;
    created_at: string;
  };
}

export interface Measure {
  count: number;
  next?: string;
  previous?: string;
  results: MeasureResult[];
}

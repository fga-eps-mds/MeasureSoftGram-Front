export interface MeasureType {
  id: number;
  key: string;
  description: string;
  name: string;
  latest: {
    id: number;
    measure_id: number;
    value: number;
    created_at: string;
  };
}

export interface MeasureResponseType {
  count: number;
  next: any;
  previous: any;
  results: Array<MeasureType>;
}

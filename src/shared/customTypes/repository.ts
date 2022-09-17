interface SqcHistory {
  id: number;
  value: number;
  created_at: Date;
}

export interface Historical {
  id: number;
  key: string;
  name: string;
  history: Array<SqcHistory>;
}

export interface Result {
  id: number;
  value: number;
  created_at: Date;
}

export interface RootObject {
  count: number;
  next?: any;
  previous?: any;
  results: Result[];
}

interface RepositoryResults {
  metrics: string;
  measures: string;
  subcharacteristics: string;
  characteristics: string;
  sqc: string;
}

export interface Repository {
  id: number;
  url: string;
  name: string;
  key: string;
  description: string;
  product: string;
  latest_values: RepositoryResults;
  historical_values: RepositoryResults;
}

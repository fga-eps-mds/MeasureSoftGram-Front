interface Results {
  metrics: string;
  measures: string;
  subcharacteristics: string;
  characteristics: string;
  sqc: string;
}

export interface Repositories {
  id: number;
  url: string;
  name: string;
  key: string;
  description: string;
  product: string;
  latest_values: Results;
  historical_values: Results;
}

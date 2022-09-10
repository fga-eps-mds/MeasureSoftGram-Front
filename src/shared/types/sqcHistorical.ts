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

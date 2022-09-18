interface SqcHistory {
  id: number;
  value: number;
  created_at: Date | string;
}

export interface Historical {
  id: number;
  key: string;
  name: string;
  history: Array<SqcHistory>;
}

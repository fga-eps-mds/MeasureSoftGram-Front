export interface Metrics {
  key: string;
  weight: number;
}

export interface Measure {
  key: string;
  weight: number;
  metrics: Metrics[];
}

export interface Subcharacteristic {
  key: string;
  weight: number;
  measures: Measure[];
}

export interface Characteristic {
  key: string;
  weight: number;
  subcharacteristics: Subcharacteristic[];
}

export interface Data {
  characteristics: Characteristic[];
}

export interface PreConfigRoot {
  id: number;
  name: string;
  created_at: Date;
  data: Data;
}

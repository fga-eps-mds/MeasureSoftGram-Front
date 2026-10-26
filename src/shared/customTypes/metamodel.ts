export type QualityModelNodeType =
  | 'tsqmi'
  | 'characteristic'
  | 'subcharacteristic'
  | 'measure'
  | 'metric';

export interface QualityModelNode {
  id: number | null;
  type: QualityModelNodeType;
  key: string;
  name: string;
  description: string | null;
  weight: number | null;
  min_threshold?: number | null;
  max_threshold?: number | null;
  children: QualityModelNode[];
}

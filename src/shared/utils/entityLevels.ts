import { EntityLevel } from '@customTypes/product';

export const NO_DATA_LABEL = 'sem dado';

export const LEVEL_LABELS: Record<EntityLevel, string> = {
  characteristic: 'Característica',
  subcharacteristic: 'Subcaracterística',
  measure: 'Medida',
  metric: 'Métrica'
};

const METRIC_UNITS: Record<string, string> = {
  PERCENT: '%',
  MILLISEC: 'ms'
};

export function getMetricUnit(metricType?: string): string {
  return (metricType && METRIC_UNITS[metricType]) || '';
}

/** Valores de característica, subcaracterística e medida vão de 0 a 1; métrica usa o valor coletado. */
export function formatEntityValue(value: number | null, level: EntityLevel, metricType?: string): string {
  if (value === null || value === undefined) return NO_DATA_LABEL;
  if (level !== 'metric') return value.toFixed(2);

  const formatted = Number.isInteger(value) ? String(value) : value.toFixed(2);
  const unit = getMetricUnit(metricType);
  return unit ? `${formatted} ${unit}` : formatted;
}

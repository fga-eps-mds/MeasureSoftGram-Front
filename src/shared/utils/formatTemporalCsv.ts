import { format } from 'date-fns';
import { CsvChart, CsvColumn } from '@utils/exportCsv';
import { TimeGranularity, TimeSeries } from '@utils/historicalValues';

/** Nome do dashboard e de cada gráfico nos arquivos exportados: `msgram-temporal-<grafico>-<data>.csv`. */
export const TEMPORAL_CSV = {
  dashboard: 'temporal',
  characteristics: 'caracteristicas',
  subcharacteristics: 'subcaracteristicas',
  measures: 'medidas',
  metrics: 'metricas'
} as const;

export type TemporalCsvLevel = Exclude<keyof typeof TEMPORAL_CSV, 'dashboard'>;

export type TemporalCsvRow = { repository: string; entity: string; date: string; value: number };

const TEMPORAL_CSV_COLUMNS: CsvColumn<TemporalCsvRow>[] = [
  { key: 'repository', title: 'Repositório' },
  { key: 'entity', title: 'Entidade' },
  { key: 'date', title: 'Data' },
  { key: 'value', title: 'Valor' }
];

const DATE_FORMATS: Record<TimeGranularity, string> = { day: 'yyyy-MM-dd', month: 'yyyy-MM' };

/**
 * CSV de um gráfico da Evolução Temporal: uma linha por ponto das entidades filtradas, na data do eixo da tela
 * (dia ou mês) e com o valor sem arredondar.
 */
export function formatTemporalCsv(
  level: TemporalCsvLevel,
  repositoryName: string,
  series: TimeSeries[],
  granularity: TimeGranularity
): CsvChart<TemporalCsvRow> {
  return {
    name: TEMPORAL_CSV[level],
    columns: TEMPORAL_CSV_COLUMNS,
    rows: series.flatMap(({ name, points }) =>
      points.map(([time, value]) => ({
        repository: repositoryName,
        entity: name,
        date: format(time, DATE_FORMATS[granularity]),
        value
      }))
    )
  };
}

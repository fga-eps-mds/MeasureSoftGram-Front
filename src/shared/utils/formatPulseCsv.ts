import { CsvChart, CsvColumn } from '@utils/exportCsv';
import { PulseMeasurement, PulseRepositoryData } from '@utils/formatPulseChart';
import { getQualityBandClamped } from '@utils/qualityBands';

/** Nome do dashboard de cada pulso e do gráfico nos arquivos exportados: `msgram-<produto|repositorio>-pulso-<data>.csv`. */
export const PULSE_CSV = { product: 'produto', repository: 'repositorio', pulse: 'pulso' };

export type ProductPulseCsvRow = { repository: string; date: string; value: number; grade: string };

const PRODUCT_PULSE_CSV_COLUMNS: CsvColumn<ProductPulseCsvRow>[] = [
  { key: 'repository', title: 'Repositório' },
  { key: 'date', title: 'Data' },
  { key: 'value', title: 'Valor' },
  { key: 'grade', title: 'Grau' }
];

export type RepositoryPulseCsvRow = {
  repository: string;
  characteristic: string;
  date: string;
  value: number;
  grade: string;
};

const REPOSITORY_PULSE_CSV_COLUMNS: CsvColumn<RepositoryPulseCsvRow>[] = [
  { key: 'repository', title: 'Repositório' },
  { key: 'characteristic', title: 'Característica' },
  { key: 'date', title: 'Data' },
  { key: 'value', title: 'Valor' },
  { key: 'grade', title: 'Grau' }
];

function byDate(measurements: PulseMeasurement[]): PulseMeasurement[] {
  return [...measurements].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

function toMeasurementFields({ created_at: date, value }: PulseMeasurement) {
  return { date, value, grade: getQualityBandClamped(value).grade };
}

/** CSV do pulso do produto: as medições do período filtrado de cada repositório, em ordem de data, com o grau (A a E). */
export function formatProductPulseCsv(repositories: PulseRepositoryData[]): CsvChart<ProductPulseCsvRow> {
  return {
    name: PULSE_CSV.pulse,
    columns: PRODUCT_PULSE_CSV_COLUMNS,
    rows: repositories.flatMap(({ name, measurements }) =>
      byDate(measurements).map((measurement) => ({ repository: name, ...toMeasurementFields(measurement) }))
    )
  };
}

/** CSV do pulso das características do repositório: as medições do período filtrado de cada característica. */
export function formatRepositoryPulseCsv(
  repositoryName: string,
  characteristics: PulseRepositoryData[]
): CsvChart<RepositoryPulseCsvRow> {
  return {
    name: PULSE_CSV.pulse,
    columns: REPOSITORY_PULSE_CSV_COLUMNS,
    rows: characteristics.flatMap(({ name, measurements }) =>
      byDate(measurements).map((measurement) => ({
        repository: repositoryName,
        characteristic: name,
        ...toMeasurementFields(measurement)
      }))
    )
  };
}

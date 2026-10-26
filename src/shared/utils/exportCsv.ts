import JSZip from 'jszip';
import { format } from 'date-fns';

export type CsvValue = string | number | boolean | null | undefined;

/** Coluna do CSV: a chave do campo na linha e o título do cabeçalho. */
export interface CsvColumn<Row> {
  key: keyof Row & string;
  title: string;
}

/** Os dados de um gráfico para exportar: `name` vai no nome do arquivo (`msgram-<dashboard>-<name>-<data>.csv`). */
export interface CsvChart<Row = Record<string, CsvValue>> {
  name: string;
  columns: CsvColumn<Row>[];
  rows: Row[];
}

const CSV_TYPE = 'text/csv;charset=utf-8';

/** Campo entre aspas quando tem vírgula, aspas ou quebra de linha, com as aspas dobradas (RFC 4180). */
function escapeCsvValue(value: CsvValue): string {
  if (value === null || value === undefined) return '';
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

/** CSV separado por vírgula, com o cabeçalho e uma linha por item, nos valores sem arredondar. */
export function toCsv<Row extends Record<string, CsvValue>>({
  columns,
  rows
}: Pick<CsvChart<Row>, 'columns' | 'rows'>) {
  const lines = [
    columns.map((column) => escapeCsvValue(column.title)),
    ...rows.map((row) => columns.map((column) => escapeCsvValue(row[column.key])))
  ];
  return lines.map((line) => line.join(',')).join('\r\n');
}

export function csvFileName(dashboard: string, chart: string, date = new Date()): string {
  return `msgram-${dashboard}-${chart}-${format(date, 'yyyy-MM-dd')}.csv`;
}

function downloadFile(content: Blob, fileName: string) {
  const url = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadCsv<Row extends Record<string, CsvValue>>(dashboard: string, chart: CsvChart<Row>) {
  downloadFile(new Blob([toCsv(chart)], { type: CSV_TYPE }), csvFileName(dashboard, chart.name));
}

/** Um `.zip` (`msgram-<dashboard>-<data>.zip`) com um CSV por gráfico, já que cada gráfico tem colunas diferentes. */
export async function downloadCsvZip<Row extends Record<string, CsvValue>>(dashboard: string, charts: CsvChart<Row>[]) {
  const date = new Date();
  const zip = new JSZip();
  charts.forEach((chart) => zip.file(csvFileName(dashboard, chart.name, date), toCsv(chart)));
  const content = await zip.generateAsync({ type: 'blob', mimeType: 'application/zip' });
  downloadFile(content, `msgram-${dashboard}-${format(date, 'yyyy-MM-dd')}.zip`);
}

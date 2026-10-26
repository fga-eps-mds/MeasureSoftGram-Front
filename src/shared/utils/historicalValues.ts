/** Uma entidade de historical-values/<nível>/ do repositório, com as medições da mais antiga para a mais nova. */
export interface EntityHistory {
  id: number;
  key: string;
  name: string;
  history: { value: number; created_at: string }[];
}

export interface HistoricalValuesResponse {
  results: EntityHistory[];
}

export type TimeGranularity = 'day' | 'month';

export interface TimeSeries {
  key: string;
  name: string;
  /** [início do dia ou do mês em ms, valor], em ordem crescente de tempo. */
  points: [number, number][];
}

function periodStart(date: Date, granularity: TimeGranularity) {
  return granularity === 'day'
    ? new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
    : new Date(date.getFullYear(), date.getMonth(), 1).getTime();
}

/**
 * Uma série por entidade pedida, na ordem de `entities`, com um ponto por dia ou por mês. Quando há mais de uma
 * medição no mesmo período, vale a última, a mesma regra do valor de uma release. Entidades sem medição ficam de fora.
 */
export function toTimeSeries(
  histories: EntityHistory[] | undefined,
  entities: { key: string; name: string }[],
  granularity: TimeGranularity
): TimeSeries[] {
  if (!histories) return [];
  const historyByKey = new Map(histories.map((item) => [item.key, item.history]));

  return entities
    .map(({ key, name }) => {
      const lastByPeriod = new Map<number, { time: number; value: number }>();
      (historyByKey.get(key) ?? []).forEach((record) => {
        const date = new Date(record.created_at);
        const period = periodStart(date, granularity);
        const previous = lastByPeriod.get(period);
        if (!previous || date.getTime() >= previous.time) {
          lastByPeriod.set(period, { time: date.getTime(), value: record.value });
        }
      });
      const points = [...lastByPeriod.entries()]
        .sort(([a], [b]) => a - b)
        .map(([period, { value }]) => [period, value] as [number, number]);
      return { key, name, points };
    })
    .filter((series) => series.points.length > 0);
}

/** Escolha de um filtro de vários valores: `all` é a opção "Todas". */
export type MultiSelection = string[] | 'all';

/**
 * Chaves que valem para o filtro com as opções atuais. O que foi escolhido e não existe mais entre as opções (porque o
 * nível anterior mudou) sai; se nada sobrar, o filtro volta para "Todas".
 */
export function resolveSelection(selection: MultiSelection, options: { key: string }[]): string[] {
  const keys = options.map((option) => option.key);
  if (selection === 'all') return keys;
  const valid = selection.filter((key) => keys.includes(key));
  return valid.length > 0 ? valid : keys;
}

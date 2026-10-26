import { toCsv } from '../exportCsv';
import { TimeSeries } from '../historicalValues';
import { TEMPORAL_CSV, formatTemporalCsv } from '../formatTemporalCsv';

const day = (isoDay: string) => new Date(`${isoDay}T00:00:00`).getTime();

const SERIES: TimeSeries[] = [
  {
    key: 'reliability',
    name: 'Reliability',
    points: [
      [day('2026-10-01'), 0.7],
      [day('2026-10-15'), 0.7333333333333333]
    ]
  },
  { key: 'maintainability', name: 'Maintainability', points: [[day('2026-11-01'), 0.8]] }
];

const lines = (chart: Parameters<typeof toCsv>[0]) => toCsv(chart).split('\r\n');

describe('formatTemporalCsv', () => {
  it('exporta um ponto por linha, com a data do dia e o valor sem arredondar', () => {
    const chart = formatTemporalCsv('characteristics', 'MeasureSoftGram-Service', SERIES, 'day');

    expect(chart.name).toBe(TEMPORAL_CSV.characteristics);
    expect(lines(chart)).toEqual([
      'Repositório,Entidade,Data,Valor',
      'MeasureSoftGram-Service,Reliability,2026-10-01,0.7',
      'MeasureSoftGram-Service,Reliability,2026-10-15,0.7333333333333333',
      'MeasureSoftGram-Service,Maintainability,2026-11-01,0.8'
    ]);
  });

  it('usa o mês como data quando o eixo está em meses', () => {
    const chart = formatTemporalCsv('measures', 'repo', SERIES, 'month');

    expect(lines(chart).slice(1, 3)).toEqual([
      'repo,Reliability,2026-10,0.7',
      'repo,Reliability,2026-10,0.7333333333333333'
    ]);
  });

  it.each([
    ['characteristics', 'caracteristicas'],
    ['subcharacteristics', 'subcaracteristicas'],
    ['measures', 'medidas'],
    ['metrics', 'metricas']
  ] as const)('nomeia o CSV do nível %s como %s', (level, name) => {
    expect(formatTemporalCsv(level, 'repo', SERIES, 'day').name).toBe(name);
  });

  it('fica sem linhas quando as entidades filtradas não têm valores', () => {
    expect(formatTemporalCsv('metrics', 'repo', [], 'day').rows).toEqual([]);
    expect(formatTemporalCsv('metrics', 'repo', [{ key: 'a', name: 'A', points: [] }], 'day').rows).toEqual([]);
  });

  it('escapa vírgula no nome da entidade', () => {
    const chart = formatTemporalCsv(
      'metrics',
      'repo',
      [{ key: 'm', name: 'a,b', points: [[day('2026-10-01'), 1]] }],
      'day'
    );

    expect(lines(chart)[1]).toBe('repo,"a,b",2026-10-01,1');
  });
});

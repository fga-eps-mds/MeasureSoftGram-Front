import { EntityHistory, resolveSelection, toTimeSeries } from '../historicalValues';

const histories: EntityHistory[] = [
  {
    id: 1,
    key: 'reliability',
    name: 'Reliability',
    history: [
      { value: 0.4, created_at: '2026-03-01T09:00:00' },
      { value: 0.6, created_at: '2026-03-01T18:00:00' },
      { value: 0.7, created_at: '2026-03-20T10:00:00' },
      { value: 0.8, created_at: '2026-04-02T10:00:00' }
    ]
  },
  { id: 2, key: 'maintainability', name: 'Maintainability', history: [] }
];

const entities = [
  { key: 'maintainability', name: 'Manutenibilidade' },
  { key: 'reliability', name: 'Confiabilidade' }
];

describe('toTimeSeries', () => {
  it('fica com a última medição de cada dia', () => {
    const [series] = toTimeSeries(histories, entities, 'day');

    expect(series.name).toBe('Confiabilidade');
    expect(series.points).toEqual([
      [new Date(2026, 2, 1).getTime(), 0.6],
      [new Date(2026, 2, 20).getTime(), 0.7],
      [new Date(2026, 3, 2).getTime(), 0.8]
    ]);
  });

  it('fica com a última medição de cada mês', () => {
    const [series] = toTimeSeries(histories, entities, 'month');

    expect(series.points).toEqual([
      [new Date(2026, 2, 1).getTime(), 0.7],
      [new Date(2026, 3, 1).getTime(), 0.8]
    ]);
  });

  it('não depende da ordem das medições', () => {
    const shuffled = [{ ...histories[0], history: [...histories[0].history].reverse() }];

    expect(toTimeSeries(shuffled, entities, 'day')).toEqual(toTimeSeries(histories, entities, 'day'));
  });

  it('deixa de fora as entidades sem medição ou fora do filtro', () => {
    expect(toTimeSeries(histories, entities, 'day').map((series) => series.key)).toEqual(['reliability']);
    expect(toTimeSeries(histories, [{ key: 'maintainability', name: 'M' }], 'day')).toEqual([]);
    expect(toTimeSeries(undefined, entities, 'day')).toEqual([]);
  });
});

describe('resolveSelection', () => {
  const options = [{ key: 'a' }, { key: 'b' }, { key: 'c' }];

  it('"Todas" vale todas as opções', () => {
    expect(resolveSelection('all', options)).toEqual(['a', 'b', 'c']);
  });

  it('mantém só as escolhas que ainda são opções', () => {
    expect(resolveSelection(['b', 'x'], options)).toEqual(['b']);
  });

  it('volta para todas quando nenhuma escolha sobrou', () => {
    expect(resolveSelection(['x'], options)).toEqual(['a', 'b', 'c']);
  });
});

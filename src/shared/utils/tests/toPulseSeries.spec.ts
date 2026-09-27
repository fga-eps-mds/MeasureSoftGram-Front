import { toPulseSeries } from '../toPulseSeries';

describe('toPulseSeries', () => {
  it('deve retornar [] para entrada vazia', () => {
    expect(toPulseSeries([], [], [])).toEqual([]);
  });

  it('deve gerar 3N pontos para N medições', () => {
    const ts = [1700000000000, 1700086400000, 1700172800000];
    const values = [0.8, 0.6, 0.9];
    const bases = [0.8, 0.6, 0.9];

    const result = toPulseSeries(ts, values, bases);

    expect(result).toHaveLength(3 * ts.length);
  });

  it('deve ter o ponto do meio de cada trio como o valor medido', () => {
    const ts = [1700000000000, 1700086400000];
    const values = [0.75, 0.85];
    const bases = [0.75, 0.85];

    const result = toPulseSeries(ts, values, bases);

    // Primeiro pico (índice 1 no trio 0..2)
    expect(result[1]).toEqual([ts[0], values[0]]);
    // Segundo pico (índice 4 no trio 3..5)
    expect(result[4]).toEqual([ts[1], values[1]]);
  });

  it('deve usar a própria base como "base anterior" para a primeira medição', () => {
    const ts = [1700000000000, 1700086400000];
    const values = [0.70, 0.90];
    const bases = [0.70, 0.90];

    const result = toPulseSeries(ts, values, bases);

    // Ponto 0 (antes da primeira medição): deve usar bases[0]
    expect(result[0][1]).toBe(bases[0]);

    // Ponto 3 (antes da segunda medição): deve usar bases[0] (base anterior)
    expect(result[3][1]).toBe(bases[0]);
  });

  it('deve assumir bases = values quando bases não for fornecido', () => {
    const ts = [1700000000000];
    const values = [0.65];

    const result = toPulseSeries(ts, values);

    expect(result).toHaveLength(3);
    expect(result[0][1]).toBe(0.65);
    expect(result[1]).toEqual([ts[0], 0.65]);
    expect(result[2][1]).toBe(0.65);
  });
});

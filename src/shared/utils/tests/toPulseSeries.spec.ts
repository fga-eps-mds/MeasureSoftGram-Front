import { toPulseSeries } from '../toPulseSeries';

describe('toPulseSeries', () => {
  it('deve retornar [] para entrada vazia', () => {
    expect(toPulseSeries([], [], [])).toEqual([]);
  });

  it('deve gerar 3N pontos para N medições', () => {
    const ts = [1700000000000, 1700086400000, 1700172800000];
    const values = [0.8, 0.6, 0.9];
    const bases = [0.7, 0.7, 0.7];

    const result = toPulseSeries(ts, values, bases);

    expect(result).toHaveLength(3 * ts.length);
  });

  it('deve ter o ponto do meio de cada trio como o valor medido e retornar à base', () => {
    const ts = [1700000000000, 1700086400000];
    const values = [0.75, 0.85];
    const bases = [0.60, 0.60];

    const result = toPulseSeries(ts, values, bases);

    // Primeiro trio
    expect(result[0][1]).toBe(0.60); // Antes: base
    expect(result[1]).toEqual([ts[0], 0.75]); // Pico: valor medido
    expect(result[2][1]).toBe(0.60); // Depois: retorna à base

    // Segundo trio
    expect(result[3][1]).toBe(0.60); // Antes: base anterior
    expect(result[4]).toEqual([ts[1], 0.85]); // Pico: valor medido
    expect(result[5][1]).toBe(0.60); // Depois: retorna à base
  });

  it('deve calcular a média dos valores como base quando bases omitido', () => {
    const ts = [1700000000000, 1700086400000];
    const values = [0.60, 0.80]; // Média = 0.70

    const result = toPulseSeries(ts, values);

    expect(result).toHaveLength(6);
    expect(result[0][1]).toBe(0.70); // Base média
    expect(result[1]).toEqual([ts[0], 0.60]); // Pico 1
    expect(result[2][1]).toBe(0.70); // Retorna à base média
    expect(result[4]).toEqual([ts[1], 0.80]); // Pico 2
    expect(result[5][1]).toBe(0.70); // Retorna à base média
  });
});


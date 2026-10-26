import { PULSE_AMPLITUDE, PULSE_POINTS_PER_MEASUREMENT, toPulseSeries } from '../toPulseSeries';

const DAY = 24 * 60 * 60 * 1000;
const ts = [1700000000000, 1700000000000 + 10 * DAY, 1700000000000 + 20 * DAY];

const peakOf = (series: [number, number][], measurement: number) =>
  series[measurement * PULSE_POINTS_PER_MEASUREMENT + 2];

describe('toPulseSeries', () => {
  it('deve retornar [] para entrada vazia', () => {
    expect(toPulseSeries([], [])).toEqual([]);
  });

  it('gera um complexo de ECG por medição', () => {
    expect(toPulseSeries(ts, [0.8, 0.6, 0.9])).toHaveLength(PULSE_POINTS_PER_MEASUREMENT * ts.length);
  });

  it('fica no nível do indicador entre as medições', () => {
    const series = toPulseSeries(ts, [0.8, 0.6, 0.9]);

    // nova base de cada medição = valor medido; a seguinte parte dele
    expect(series[4]).toEqual([expect.any(Number), 0.8]);
    expect(series[5][1]).toBe(0.8);
    expect(series[9][1]).toBe(0.6);
    expect(series[14][1]).toBe(0.9);
  });

  it('o pico sobe quando o indicador melhora e desce quando piora, com a variação ampliada', () => {
    const series = toPulseSeries(ts, [0.5, 0.52, 0.49]);

    expect(peakOf(series, 1)[0]).toBe(ts[1]);
    expect(peakOf(series, 1)[1]).toBeCloseTo(0.5 + 0.02 * PULSE_AMPLITUDE.gain);
    expect(peakOf(series, 2)[1]).toBeCloseTo(0.52 - 0.03 * PULSE_AMPLITUDE.gain);
  });

  it('bate com a amplitude mínima sem variação e limita os picos grandes', () => {
    const series = toPulseSeries(ts, [0.5, 0.5, 0.9]);

    expect(peakOf(series, 0)[1]).toBeCloseTo(0.5 + PULSE_AMPLITUDE.min);
    expect(peakOf(series, 1)[1]).toBeCloseTo(0.5 + PULSE_AMPLITUDE.min);
    expect(peakOf(series, 2)[1]).toBeCloseTo(0.5 + PULSE_AMPLITUDE.max);
  });
});

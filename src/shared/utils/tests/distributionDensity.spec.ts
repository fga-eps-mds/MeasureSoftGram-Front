import {
  buildDensity,
  DENSITY_POINTS,
  DensityPoint,
  gaussianDensity,
  sampleStandardDeviation,
  silvermanBandwidth
} from '../distributionDensity';

/** Área sob os pontos pela regra do trapézio. */
function area(points: DensityPoint[]): number {
  return points.slice(1).reduce((sum, point, index) => {
    const previous = points[index];
    return sum + ((point.x - previous.x) * (point.y + previous.y)) / 2;
  }, 0);
}

describe('sampleStandardDeviation', () => {
  it('divide por n − 1, como o DESVPAD.A', () => {
    expect(sampleStandardDeviation([0, 1, 2])).toBe(1);
    expect(sampleStandardDeviation([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(2.13809, 5);
  });
});

describe('silvermanBandwidth', () => {
  it('usa o IQR / 1,34 quando ele é menor que o desvio', () => {
    // s = 1 e IQR (QUARTIL.INC) = 1: h = 0,9 · (1 / 1,34) · 3^(−1/5)
    expect(silvermanBandwidth([0, 1, 2], 1)).toBeCloseTo(0.539155, 6);
  });

  it('usa o desvio quando ele é menor que o IQR / 1,34', () => {
    // s = 1 e IQR / 1,34 ≈ 1,49: h = 0,9 · 1 · 3^(−1/5)
    expect(silvermanBandwidth([0, 1, 2], 2)).toBeCloseTo(0.9 * 3 ** -0.2, 10);
  });

  it('com o IQR zero ou ausente, usa o desvio', () => {
    const values = [0.5, 0.5, 0.5, 0.5, 0.9];
    const expected = 0.9 * sampleStandardDeviation(values) * 5 ** -0.2;

    expect(silvermanBandwidth(values, 0)).toBeCloseTo(expected, 10);
    expect(silvermanBandwidth(values, null)).toBeCloseTo(expected, 10);
  });

  it('não tem banda com menos de 3 análises ou com todas iguais', () => {
    expect(silvermanBandwidth([], null)).toBeNull();
    expect(silvermanBandwidth([0.4, 0.6], 0.1)).toBeNull();
    expect(silvermanBandwidth([0.7, 0.7, 0.7], 0)).toBeNull();
  });
});

describe('gaussianDensity', () => {
  it('é a média dos kernels gaussianos centrados em cada análise', () => {
    const h = silvermanBandwidth([0, 1, 2], 1) as number;

    expect(gaussianDensity([0, 1, 2], h, 1)).toBeCloseTo(0.334974, 6);
    expect(gaussianDensity([0, 1, 2], h, 0)).toBeCloseTo(0.291064, 6);
    expect(gaussianDensity([0, 1, 2], h, -1)).toBeCloseTo(0.044417, 6);
  });

  it('com uma análise só, é a normal centrada nela', () => {
    expect(gaussianDensity([3], 2, 3)).toBeCloseTo(1 / (2 * Math.sqrt(2 * Math.PI)), 10);
  });
});

describe('buildDensity', () => {
  const values = [0.31, 0.52, 0.55, 0.56, 0.6, 0.9];
  const iqr = 0.0875;

  it('tem os pontos igualmente espaçados do início ao fim do eixo', () => {
    const points = buildDensity(values, { min: 0, max: 1, iqr }) as DensityPoint[];

    expect(points).toHaveLength(DENSITY_POINTS);
    expect(points[0].x).toBe(0);
    expect(points[DENSITY_POINTS - 1].x).toBe(1);
    expect(points[1].x - points[0].x).toBeCloseTo(1 / (DENSITY_POINTS - 1), 12);
    expect(points.every((point) => point.y >= 0)).toBe(true);
  });

  it('com valores longe das bordas, a área sob a curva no eixo é perto de 1', () => {
    // IQR pelo QUARTIL.INC: 0,5875 − 0,44; h ≈ 0,07, e a curva acaba antes de 0 e de 1
    const middle = [0.3, 0.42, 0.5, 0.55, 0.6, 0.7];
    const points = buildDensity(middle, { min: 0, max: 1, iqr: 0.1475 }, 1001) as DensityPoint[];

    expect(area(points)).toBeCloseTo(1, 3);
  });

  it('a área da curva inteira (mín − 4h a máx + 4h) é perto de 1, inclusive numa métrica', () => {
    const metric = [42, 44, 47, 55, 63, 120];
    const h = silvermanBandwidth(metric, 13) as number;
    const points = buildDensity(metric, { min: 42 - 4 * h, max: 120 + 4 * h, iqr: 13 }, 2001) as DensityPoint[];

    expect(area(points)).toBeCloseTo(1, 3);
  });

  it('com valores perto da borda, a curva é cortada pelo eixo de 0 a 1, sem renormalizar', () => {
    const nearOne = [0.9, 0.95, 0.97, 0.99, 1];
    const points = buildDensity(nearOne, { min: 0, max: 1, iqr: 0.04 }, 1001) as DensityPoint[];

    expect(area(points)).toBeLessThan(0.9);
    expect(points[points.length - 1].y).toBeGreaterThan(0);
  });

  it('não tem curva com menos de 3 análises ou com todas iguais (CA9)', () => {
    expect(buildDensity([0.5, 0.6], { min: 0, max: 1, iqr: 0.05 })).toBeNull();
    expect(buildDensity([0.5, 0.5, 0.5, 0.5], { min: 0, max: 1, iqr: 0 })).toBeNull();
  });
});

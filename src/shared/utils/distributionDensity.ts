/** A curva precisa de pelo menos 3 análises, como a assimetria (CA9). */
export const MIN_ANALYSES_FOR_DENSITY = 3;

/** Pontos da curva no eixo: o bastante para ela parecer contínua num quadro largo. */
export const DENSITY_POINTS = 120;

const SQRT_2PI = Math.sqrt(2 * Math.PI);

export interface DensityPoint {
  x: number;
  y: number;
}

/** Desvio padrão amostral (n − 1), como o DESVPAD.A. */
export function sampleStandardDeviation(values: number[]): number {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const squares = values.reduce((sum, value) => sum + (value - mean) ** 2, 0);
  return Math.sqrt(squares / (values.length - 1));
}

/**
 * Largura de banda pela regra de Silverman: h = 0,9 · min(s, IQR / 1,34) · n^(−1/5), com s amostral e o IQR do
 * Service. Com o IQR zero (mais da metade das análises com o mesmo valor) ou ausente, o min daria 0, e a banda usa s.
 * Null quando não há curva: menos de 3 análises ou todas iguais (s = 0).
 */
export function silvermanBandwidth(values: number[], iqr: number | null): number | null {
  if (values.length < MIN_ANALYSES_FOR_DENSITY) return null;
  // compara os valores, e não s = 0: a média de 0,7 três vezes é 0,6999…, e s sairia com um resíduo positivo
  if (values.every((value) => value === values[0])) return null;
  const s = sampleStandardDeviation(values);
  const spread = iqr ? Math.min(s, iqr / 1.34) : s;
  return 0.9 * (spread > 0 ? spread : s) * values.length ** -0.2;
}

/** Densidade estimada em x: a média dos kernels gaussianos de largura h centrados em cada análise. */
export function gaussianDensity(values: number[], bandwidth: number, x: number): number {
  const sum = values.reduce((total, value) => {
    const u = (x - value) / bandwidth;
    return total + Math.exp(-0.5 * u * u);
  }, 0);
  return sum / (values.length * bandwidth * SQRT_2PI);
}

/**
 * Curva de densidade das análises (CA5): kernel gaussiano com a banda de Silverman, em pontos igualmente espaçados de
 * min a max, o mesmo eixo do histograma. A área sob a curva inteira é 1, mas ela não é renormalizada ao eixo: no eixo
 * de 0 a 1, com valores perto de 0 ou de 1, parte dos kernels cai fora do eixo, a curva é cortada nas bordas e a
 * área visível fica um pouco abaixo de 1. Null quando não há curva (menos de 3 análises ou todas iguais).
 */
export function buildDensity(
  values: number[],
  { min, max, iqr }: { min: number; max: number; iqr: number | null },
  points = DENSITY_POINTS
): DensityPoint[] | null {
  const bandwidth = silvermanBandwidth(values, iqr);
  if (bandwidth === null) return null;

  const step = (max - min) / (points - 1);
  return Array.from({ length: points }, (_, index) => {
    // o último ponto é o max exato, sem o resíduo da soma
    const x = index === points - 1 ? max : min + index * step;
    return { x, y: gaussianDensity(values, bandwidth, x) };
  });
}

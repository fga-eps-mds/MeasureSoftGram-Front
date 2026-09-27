const DAY = 24 * 60 * 60 * 1000;

/**
 * Converte medições em pontos de pulso (ECG) para uma série `line` do ECharts.
 * @param ts Timestamps (em milissegundos) em ordem crescente
 * @param values Valores medidos (picos do pulso de variação)
 * @param bases Níveis de base do pulso (se omitido, calcula a média dos valores)
 */
export function toPulseSeries(
  ts: number[],
  values: number[],
  bases?: number[]
): [number, number][] {
  if (!ts || !ts.length) return [];

  // Se a base não for informada, utiliza a média das medições como a linha de base horizontal (ECG)
  const avgValue = values.reduce((acc, curr) => acc + curr, 0) / values.length;
  const actualBases = bases && bases.length === values.length
    ? bases
    : values.map(() => avgValue);

  const span = ts.length > 1 ? ts[ts.length - 1] - ts[0] : DAY;
  const w = Math.max(span / 800, DAY / 24); // Largura do pico de pulso

  return ts.flatMap((t, i) => {
    const prevBase = i > 0 ? actualBases[i - 1] : actualBases[i];
    const currentBase = actualBases[i];
    const peakValue = values[i];

    return [
      [t - w, prevBase],    // 1. Instante antes: na base anterior
      [t, peakValue],       // 2. No instante da medição: valor medido (pico)
      [t + w, currentBase], // 3. Instante depois: retorna ao nível de base
    ] as [number, number][];
  });
}

export default toPulseSeries;


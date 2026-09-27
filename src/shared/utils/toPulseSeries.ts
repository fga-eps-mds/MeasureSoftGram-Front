const DAY = 24 * 60 * 60 * 1000;

/**
 * Converte medições em pontos de pulso para uma série `line` do ECharts.
 * @param ts Timestamps (em milissegundos) em ordem crescente
 * @param values Valores medidos (ex: TSQMI de 0 a 1)
 * @param bases Níveis de base (se omitido ou vazio, assume os próprios `values`)
 */
export function toPulseSeries(
  ts: number[],
  values: number[],
  bases: number[] = values
): [number, number][] {
  if (!ts || !ts.length) return [];
  
  const actualBases = bases && bases.length === values.length ? bases : values;
  const span = ts.length > 1 ? ts[ts.length - 1] - ts[0] : DAY;
  const w = Math.max(span / 900, DAY / 12); // Largura do pico proporcional ao período exibido

  return ts.flatMap((t, i) => [
    [t - w, i > 0 ? actualBases[i - 1] : actualBases[i]], // Antes: base anterior
    [t, values[i]],                                        // Pico: valor medido
    [t + w, actualBases[i]],                               // Depois: base atual
  ] as [number, number][]);
}

export default toPulseSeries;

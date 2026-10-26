const DAY = 24 * 60 * 60 * 1000;

/** Pontos de cada medição na série: base, vale, pico, recuo e a nova base. */
export const PULSE_POINTS_PER_MEASUREMENT = 5;

/** Amplitude dos picos, na escala do indicador (0 a 1): a variação é ampliada para o batimento ficar visível. */
export const PULSE_AMPLITUDE = {
  /** Quanto a variação entre medições é ampliada. */
  gain: 10,
  /** Batimento mínimo, mesmo sem variação. */
  min: 0.08,
  max: 0.4,
};

/**
 * Converte medições em um pulso de eletrocardiograma para uma série `line` do ECharts. A linha fica no nível do
 * indicador e, em cada medição, faz um complexo (vale, pico e recuo) cuja altura é a variação em relação à medição
 * anterior, ampliada; sobe quando o indicador melhora e desce quando piora.
 * O valor medido é a nova base de cada complexo; o `y` do pico é ampliado e não é um valor medido.
 * @param ts Timestamps (em milissegundos) em ordem crescente
 * @param values Valores medidos, na mesma ordem
 */
export function toPulseSeries(ts: number[], values: number[]): [number, number][] {
  if (!ts || !ts.length) return [];

  const span = ts.length > 1 ? ts[ts.length - 1] - ts[0] : DAY;
  const w = Math.max(span / 700, DAY / 24); // meia largura do complexo

  return ts.flatMap((t, i) => {
    const current = values[i];
    const previous = i > 0 ? values[i - 1] : current;
    const delta = current - previous;
    const direction = delta < 0 ? -1 : 1;
    const amplitude =
      direction * Math.min(PULSE_AMPLITUDE.max, Math.max(PULSE_AMPLITUDE.min, Math.abs(delta) * PULSE_AMPLITUDE.gain));

    return [
      [t - 2 * w, previous], // base anterior
      [t - w, previous - amplitude * 0.25], // vale
      [t, previous + amplitude], // pico
      [t + w, current - amplitude * 0.35], // recuo
      [t + 2 * w, current], // nova base, no valor medido
    ] as [number, number][];
  });
}

export default toPulseSeries;

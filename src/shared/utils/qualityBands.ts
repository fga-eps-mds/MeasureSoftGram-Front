export type QualityGrade = 'A' | 'B' | 'C' | 'D' | 'E';

export interface QualityBand {
  grade: QualityGrade;
  /** Início da faixa, inclusive. */
  min: number;
  /** Fim da faixa, exclusive; a faixa A inclui o 1. */
  max: number;
  color: string;
  label: string;
}

/**
 * Faixas de cor do Indicador Total da Qualidade, definidas pelo PO na US06.01, para valores de 0 a 1, da pior para a
 * melhor.
 */
export const QUALITY_BANDS: QualityBand[] = [
  { grade: 'E', min: 0, max: 0.2, color: '#D7191C', label: 'Muito ruim' },
  { grade: 'D', min: 0.2, max: 0.4, color: '#FE7D37', label: 'Ruim' },
  { grade: 'C', min: 0.4, max: 0.6, color: '#DFB317', label: 'Bom' },
  { grade: 'B', min: 0.6, max: 0.8, color: '#8CC63F', label: 'Muito bom' },
  { grade: 'A', min: 0.8, max: 1, color: '#1A9641', label: 'Ótimo' }
];

/** Faixa de um valor de 0 a 1; fora disso, undefined. */
export function getQualityBand(value: number): QualityBand | undefined {
  if (value < 0 || value > 1) return undefined;
  return QUALITY_BANDS.find((band) => value < band.max) ?? QUALITY_BANDS[QUALITY_BANDS.length - 1];
}

/** Faixa de um valor, levando o que passar de 0 a 1 para a faixa da ponta (E abaixo de 0, A acima de 1). */
export function getQualityBandClamped(value: number): QualityBand {
  return getQualityBand(Math.min(1, Math.max(0, value))) as QualityBand;
}

const decimal = (value: number) => value.toFixed(2).replace('.', ',');

/** Intervalo da faixa para as legendas: "0,00 a 0,19" … "0,80 a 1,00". */
export function formatQualityBandRange(band: QualityBand): string {
  const end = band.max === 1 ? 1 : band.max - 0.01;
  return `${decimal(band.min)} a ${decimal(end)}`;
}

/** Peças do `visualMap` do ECharts que pintam uma série pela faixa do valor. */
export function getQualityVisualMapPieces() {
  return QUALITY_BANDS.map((band, index) => {
    const isFirst = index === 0;
    const isLast = index === QUALITY_BANDS.length - 1;
    return {
      ...(isFirst ? {} : { gte: band.min }),
      ...(isLast ? {} : { lt: band.max }),
      color: band.color
    };
  });
}

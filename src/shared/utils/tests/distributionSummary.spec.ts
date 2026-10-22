import { DistributionSummary } from '@customTypes/product';
import {
  describeSkewness,
  formatAnalysisCount,
  formatPeriod,
  formatStatistic,
  getSkewnessWarning,
  getSummaryRows
} from '../distributionSummary';

// valores sem arredondamento, como o Service devolve
const summary: DistributionSummary = {
  count: 60,
  min: 0.2,
  p10: 0.43,
  q1: 0.4925,
  median: 0.55,
  q3: 0.6175,
  p90: 0.66,
  max: 0.9,
  iqr: 0.125,
  lower_limit: 0.3051,
  upper_limit: 0.805,
  outliers: 3,
  mean: 0.5512345,
  skewness: -0.1634
};

const empty: DistributionSummary = {
  count: 0,
  min: null,
  p10: null,
  q1: null,
  median: null,
  q3: null,
  p90: null,
  max: null,
  iqr: null,
  lower_limit: null,
  upper_limit: null,
  outliers: 0,
  mean: null,
  skewness: null
};

describe('formatStatistic', () => {
  it.each<[number | null, string]>([
    [0.5512345, '0,55'],
    [0.125, '0,13'],
    [12, '12,00'],
    [1284.5, '1.284,50'],
    [-0.1634, '-0,16'],
    [-0.001, '0,00'],
    [null, '—']
  ])('%p vira %p', (value, text) => {
    expect(formatStatistic(value)).toBe(text);
  });
});

describe('formatAnalysisCount', () => {
  it('conta no singular e no plural', () => {
    expect(formatAnalysisCount(1)).toBe('1 análise');
    expect(formatAnalysisCount(0)).toBe('0 análises');
    expect(formatAnalysisCount(1500)).toBe('1.500 análises');
  });
});

describe('getSummaryRows', () => {
  it('traz as 12 linhas da referência com duas casas e o IQR destacado', () => {
    expect(getSummaryRows(summary)).toEqual([
      { label: 'Análises', value: '60' },
      { label: 'Mínimo', value: '0,20' },
      { label: 'Q1 (1º quartil)', value: '0,49' },
      { label: 'Mediana', value: '0,55' },
      { label: 'Q3 (3º quartil)', value: '0,62' },
      { label: 'Máximo', value: '0,90' },
      { label: 'IQR (Q3 − Q1)', value: '0,13', highlight: true },
      { label: 'Limite inferior', value: '0,31' },
      { label: 'Limite superior', value: '0,81' },
      { label: 'Discrepantes', value: '3' },
      { label: 'Média', value: '0,55' },
      { label: 'Assimetria', value: '-0,16' }
    ]);
  });

  it('mostra "—" no que o Service devolve null', () => {
    const values = getSummaryRows(empty).map((row) => row.value);

    expect(values).toEqual(['0', '—', '—', '—', '—', '—', '—', '—', '—', '0', '—', '—']);
  });
});

describe('describeSkewness', () => {
  it('explica o sinal da assimetria', () => {
    expect(describeSkewness(0.8)).toMatch(/^Assimetria positiva \(0,80\): a cauda longa fica à direita/);
    expect(describeSkewness(-0.16)).toMatch(/^Assimetria negativa \(-0,16\): a cauda longa fica à esquerda/);
    expect(describeSkewness(0.001)).toMatch(/^Assimetria perto de zero/);
    expect(describeSkewness(null)).toBeNull();
  });
});

describe('getSkewnessWarning', () => {
  it('avisa que faltam análises com menos de 3', () => {
    expect(getSkewnessWarning({ count: 2, skewness: null })).toBe(
      'Faltam análises para a assimetria: ela precisa de pelo menos 3, e o período tem 2 análises.'
    );
    expect(getSkewnessWarning({ count: 1, skewness: null })).toMatch(/o período tem 1 análise\.$/);
  });

  it('com 3 ou mais e sem assimetria, explica que os valores são todos iguais', () => {
    expect(getSkewnessWarning({ count: 5, skewness: null })).toBe(
      'Sem assimetria: todas as análises do período têm o mesmo valor.'
    );
  });

  it('não avisa nada quando a assimetria foi calculada', () => {
    expect(getSkewnessWarning({ count: 60, skewness: -0.16 })).toBeNull();
  });
});

describe('formatPeriod', () => {
  it('mostra o dia e o mês da primeira e da última análise', () => {
    expect(formatPeriod('2026-08-17T10:02:00-03:00', '2026-10-16T18:40:00-03:00')).toBe('17 ago a 16 out');
  });

  it('num dia só, mostra a data uma vez', () => {
    expect(formatPeriod('2026-08-17T10:02:00-03:00', '2026-08-17T18:40:00-03:00')).toBe('17 ago');
  });

  it('com anos diferentes, mostra o ano', () => {
    expect(formatPeriod('2026-12-28T10:00:00-03:00', '2027-01-03T10:00:00-03:00')).toBe('28 dez 2026 a 3 jan 2027');
  });
});

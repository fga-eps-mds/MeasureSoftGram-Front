import { DistributionLevel } from '@customTypes/product';
import {
  buildHistogram,
  formatAxisValue,
  formatBinLabel,
  getMetricBinWidth,
  isUnitScale
} from '../distributionHistogram';

function counts(values: number[], level: DistributionLevel) {
  return buildHistogram(values, level).bins.map((bin) => bin.count);
}

describe('isUnitScale', () => {
  it('só a métrica fica fora do eixo de 0 a 1', () => {
    const levels: DistributionLevel[] = ['tsqmi', 'characteristic', 'subcharacteristic', 'measure'];

    expect(levels.every(isUnitScale)).toBe(true);
    expect(isUnitScale('metric')).toBe(false);
  });
});

describe('buildHistogram · valores de 0 a 1', () => {
  it('tem 10 faixas de 0,10 de 0 a 1', () => {
    const histogram = buildHistogram([0.55], 'characteristic');

    expect(histogram).toMatchObject({ unit: true, width: 0.1, min: 0, max: 1 });
    expect(histogram.bins.map((bin) => [bin.start, bin.end])).toEqual([
      [0, 0.1],
      [0.1, 0.2],
      [0.2, 0.3],
      [0.3, 0.4],
      [0.4, 0.5],
      [0.5, 0.6],
      [0.6, 0.7],
      [0.7, 0.8],
      [0.8, 0.9],
      [0.9, 1]
    ]);
  });

  it('põe cada valor na faixa que começa nele, e o 1 na última', () => {
    expect(counts([0, 0.3, 0.6, 0.7, 0.29999, 1, 0.95], 'tsqmi')).toEqual([1, 0, 1, 1, 0, 0, 1, 1, 0, 2]);
  });

  it('sem análises, as faixas ficam zeradas', () => {
    expect(counts([], 'measure')).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });
});

describe('getMetricBinWidth', () => {
  it.each<[number, number, string, number]>([
    [0, 100, 'INT', 10],
    [40, 63, 'INT', 5],
    [0, 7, 'INT', 1],
    [1200, 9800, 'INT', 1000],
    [0, 1, 'FLOAT', 0.1],
    [0, 23, 'FLOAT', 2.5],
    [0.1, 0.5, 'PERCENT', 0.05],
    [5, 5, 'INT', 1],
    [0.37, 0.37, 'FLOAT', 1]
  ])('de %p a %p (%s): faixas de %p', (min, max, type, width) => {
    expect(getMetricBinWidth(min, max, type)).toBe(width);
  });

  it('numa métrica INT a largura é sempre inteira', () => {
    expect(getMetricBinWidth(0, 23, 'INT')).toBe(5);
    expect(getMetricBinWidth(0, 3, 'INT')).toBe(1);
  });
});

describe('buildHistogram · métricas', () => {
  it('segue a escala da métrica, a partir do múltiplo da largura abaixo do mínimo', () => {
    const histogram = buildHistogram([42, 44, 47, 55, 63], 'metric', 'INT');

    expect(histogram).toMatchObject({ unit: false, integer: true, width: 5, min: 40, max: 65 });
    expect(histogram.bins.map((bin) => bin.count)).toEqual([2, 1, 0, 1, 1]);
  });

  it('o máximo na borda ganha uma faixa própria, como numa contagem de inteiros', () => {
    const histogram = buildHistogram([0, 50, 100], 'metric', 'INT');

    expect(histogram.bins).toHaveLength(11);
    expect(histogram.bins[10]).toEqual({ start: 100, end: 110, count: 1 });
  });

  it('com todos os valores iguais, desenha uma barra só', () => {
    expect(buildHistogram([7, 7, 7], 'metric', 'INT').bins).toEqual([{ start: 7, end: 8, count: 3 }]);
  });

  it('sem análises, não tem faixas', () => {
    expect(buildHistogram([], 'metric', 'INT').bins).toEqual([]);
  });

  it('em métricas não inteiras, as bordas ficam sem ruído de ponto flutuante', () => {
    const histogram = buildHistogram([0.1, 0.3, 0.5], 'metric', 'PERCENT');

    expect(histogram.bins.map((bin) => bin.start)).toEqual([0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5]);
    expect(histogram.bins.map((bin) => bin.count)).toEqual([1, 0, 0, 0, 1, 0, 0, 0, 1]);
  });
});

describe('formatBinLabel', () => {
  it('no eixo de 0 a 1, mostra as bordas com duas casas', () => {
    expect(formatBinLabel({ start: 0.3, end: 0.4, count: 1 }, { unit: true, integer: false })).toBe('0,30 a 0,40');
  });

  it('numa métrica INT, mostra o primeiro e o último inteiro da faixa', () => {
    expect(formatBinLabel({ start: 40, end: 45, count: 1 }, { unit: false, integer: true })).toBe('40 a 44');
    expect(formatBinLabel({ start: 7, end: 8, count: 1 }, { unit: false, integer: true })).toBe('7');
  });

  it('nas outras métricas, mostra as bordas', () => {
    expect(formatBinLabel({ start: 0.25, end: 0.5, count: 1 }, { unit: false, integer: false })).toBe('0,25 a 0,5');
  });
});

describe('formatAxisValue', () => {
  it('usa vírgula e separador de milhar, sem zeros à direita', () => {
    expect(formatAxisValue(0.1)).toBe('0,1');
    expect(formatAxisValue(1200)).toBe('1.200');
    expect(formatAxisValue(1)).toBe('1');
  });
});

import { DistributionAnalysis } from '@customTypes/product';
import { buildHistogram } from '../distributionHistogram';
import {
  DISTRIBUTION_COLORS,
  formatBoxTooltip,
  formatHistogramOptions,
  outlierSymbolSize,
  renderHistogramBar
} from '../formatDistributionCharts';

function analysis(value: number): DistributionAnalysis {
  return { date: '2026-08-17T10:00:00-03:00', value, is_outlier: true };
}

describe('outlierSymbolSize', () => {
  it('aumenta o ponto que junta mais de uma análise', () => {
    const symbolSize = outlierSymbolSize([
      { value: 30, analyses: [analysis(30)] },
      { value: 40, analyses: [analysis(40), analysis(40)] }
    ]);

    expect(symbolSize(null, { dataIndex: 0 })).toBe(9);
    expect(symbolSize(null, { dataIndex: 1 })).toBe(12);
  });
});

describe('formatBoxTooltip', () => {
  it('mostra a caixa e as hastes com duas casas, com o título escapado', () => {
    const stats = { low: 0.2, q1: 0.4925, median: 0.55, q3: 0.6175, high: 0.8, outliers: [] };

    expect(formatBoxTooltip(stats, '<Reliability>')).toBe(
      '<strong>&#60;Reliability&#62;</strong><br/>Haste superior: 0,80<br/>Q3: 0,62<br/>Mediana: 0,55<br/>Q1: 0,49<br/>Haste inferior: 0,20'
    );
  });
});

describe('renderHistogramBar', () => {
  it('desenha um retângulo do início ao fim da faixa, do zero até a contagem', () => {
    const values = [10, 20, 4];
    const api = {
      value: (dimension: number) => values[dimension],
      coord: ([x, y]: number[]) => [x * 10, 200 - y * 10]
    };

    expect(renderHistogramBar({} as never, api as never)).toEqual({
      type: 'rect',
      shape: { x: 101, y: 160, width: 98, height: 40 },
      style: { fill: DISTRIBUTION_COLORS.bar },
      emphasis: { style: { fill: DISTRIBUTION_COLORS.barHover } }
    });
  });
});

describe('formatHistogramOptions', () => {
  it('nos valores de 0 a 1, desenha 10 faixas de 0,10 num eixo de 0 a 1', () => {
    const histogram = buildHistogram([0.52, 0.55, 0.61, 0.9], 'characteristic');
    const option = formatHistogramOptions(histogram, 'Reliability');

    expect(option.xAxis).toMatchObject({ min: 0, max: 1, interval: 0.1 });
    expect(option.series[0].data).toHaveLength(10);
    expect(option.series[0].data[5]).toEqual([0.5, 0.6, 2]);
    expect(option.series[0].tooltip.formatter({ dataIndex: 5 })).toBe('0,50 a 0,60<br/><strong>2 análises</strong>');
    expect(option.aria.label.description).toBe(
      'Histograma de Reliability: 4 análises em faixas de 0,1. 0,50 a 0,60: 2 análises; 0,60 a 0,70: 1 análise; 0,90 a 1,00: 1 análise.'
    );
  });

  it('numa métrica, o eixo segue a escala dela', () => {
    const histogram = buildHistogram([42, 44, 47, 55, 63], 'metric', 'INT');
    const option = formatHistogramOptions(histogram, 'total_issues');

    expect(option.xAxis).toMatchObject({ min: 40, max: 65, interval: 5 });
    expect(option.series[0].data).toEqual([
      [40, 45, 2],
      [45, 50, 1],
      [50, 55, 0],
      [55, 60, 1],
      [60, 65, 1]
    ]);
    expect(option.series[0].tooltip.formatter({ dataIndex: 0 })).toBe('40 a 44<br/><strong>2 análises</strong>');
  });
});

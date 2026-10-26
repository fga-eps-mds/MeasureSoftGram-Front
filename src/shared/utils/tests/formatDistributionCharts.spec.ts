import { DistributionAnalysis, DistributionEntity } from '@customTypes/product';
import { buildDensity, DensityPoint } from '../distributionDensity';
import { buildHistogram } from '../distributionHistogram';
import {
  DISTRIBUTION_COLORS,
  BOXPLOT_GRID,
  BOXPLOT_ROW_HEIGHT,
  formatAnalysisDateTime,
  formatBoxTooltip,
  formatDensityOptions,
  formatHistogramOptions,
  formatLevelBoxplotOptions,
  formatMedianLabel,
  formatScatterOptions,
  getLevelBoxplotHeight,
  getLevelBoxplotRows,
  OUTLIER_STYLE,
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

describe('formatDensityOptions', () => {
  const values = [0.31, 0.52, 0.55, 0.56, 0.6, 0.9];
  const histogram = buildHistogram(values, 'tsqmi');
  const points = buildDensity(values, { min: 0, max: 1, iqr: 0.0875 }) as DensityPoint[];

  it('usa o mesmo eixo e as mesmas margens do histograma', () => {
    const option = formatDensityOptions(points, histogram, 0.555, 'TSQMI');
    const bars = formatHistogramOptions(histogram, 'TSQMI');

    expect(option.xAxis).toEqual(bars.xAxis);
    expect(option.grid).toMatchObject({ left: bars.grid.left, right: bars.grid.right });
  });

  it('desenha a curva com a área preenchida em cor clara', () => {
    const [curve] = formatDensityOptions(points, histogram, 0.555, 'TSQMI').series;

    expect(curve).toMatchObject({
      name: 'Densidade',
      type: 'line',
      showSymbol: false,
      areaStyle: { color: DISTRIBUTION_COLORS.densityFill }
    });
    expect(curve.data).toHaveLength(points.length);
    expect(curve.data[0]).toEqual([points[0].x, points[0].y]);
  });

  it('marca a mediana numa linha vertical, com o valor na legenda (CA5)', () => {
    const option = formatDensityOptions(points, histogram, 0.555, 'TSQMI');

    expect(option.legend.data).toEqual(['Densidade', 'Mediana (0,56)']);
    expect(option.series[1]).toMatchObject({ name: 'Mediana (0,56)', data: [] });
    expect(option.series[1].markLine?.data).toEqual([{ xAxis: 0.555 }]);
  });

  it('sem mediana, só a curva', () => {
    const option = formatDensityOptions(points, histogram, null, 'TSQMI');

    expect(option.legend.data).toEqual(['Densidade']);
    expect(option.series).toHaveLength(1);
  });

  it('esconde os rótulos e as marcas do eixo y, mantendo a grade, como na tela de referência', () => {
    const { yAxis } = formatDensityOptions(points, histogram, 0.555, 'TSQMI');

    expect(yAxis.axisLabel).toMatchObject({ show: false });
    expect(yAxis.axisTick).toMatchObject({ show: false });
    expect(yAxis.splitLine).toMatchObject({ show: true, lineStyle: { color: expect.any(String) } });
  });

  it('descreve a curva no texto acessível e mostra o valor e a densidade no tooltip', () => {
    const option = formatDensityOptions(points, histogram, 0.555, 'TSQMI');

    expect(option.aria.label.description).toMatch(
      /^Curva de densidade de TSQMI, de 0 a 1, com o pico em 0,5\d\. Mediana \(0,56\)\.$/
    );
    expect(option.tooltip.formatter([{ value: [0.5, 2.345] }])).toBe('0,50<br/>Densidade: <strong>2,35</strong>');
  });
});

describe('formatMedianLabel', () => {
  it('mostra a mediana com duas casas', () => {
    expect(formatMedianLabel(0.5)).toBe('Mediana (0,50)');
    expect(formatMedianLabel(47)).toBe('Mediana (47,00)');
  });
});

describe('formatAnalysisDateTime', () => {
  it('mostra a data e a hora da análise em pt-BR', () => {
    expect(formatAnalysisDateTime('2026-08-17T10:05:00-03:00')).toBe('17/08/2026 às 10:05');
  });
});

describe('formatScatterOptions', () => {
  const summary = {
    count: 4,
    min: 0.31,
    p10: 0.4,
    q1: 0.5125,
    median: 0.555,
    q3: 0.6,
    p90: 0.8,
    max: 0.9,
    iqr: 0.0875,
    lower_limit: 0.38,
    upper_limit: 0.73,
    outliers: 2,
    mean: 0.58,
    skewness: 0.1
  };
  const tsqmi: DistributionEntity = {
    key: 'tsqmi',
    name: 'TSQMI',
    level: 'tsqmi',
    metric_type: null,
    summary,
    analyses: [
      { date: '2026-08-17T10:00:00-03:00', value: 0.31, is_outlier: true },
      { date: '2026-08-18T10:00:00-03:00', value: 0.52, is_outlier: false },
      { date: '2026-08-19T10:00:00-03:00', value: 0.56, is_outlier: false },
      { date: '2026-08-22T10:00:00-03:00', value: 0.9, is_outlier: true }
    ]
  };
  const histogram = buildHistogram([0.31, 0.52, 0.56, 0.9], 'tsqmi');
  const at = (date: string) => new Date(date).getTime();

  it('põe um ponto por análise na data dela, com os discrepantes em círculo vazado (CA7)', () => {
    const [regular, outliers] = formatScatterOptions(tsqmi, histogram).series;

    expect(regular).toMatchObject({ name: 'Análise', type: 'scatter' });
    expect(regular.data).toEqual([
      [at('2026-08-18T10:00:00-03:00'), 0.52],
      [at('2026-08-19T10:00:00-03:00'), 0.56]
    ]);
    expect(outliers).toMatchObject({ name: 'Valor discrepante', type: 'scatter', ...OUTLIER_STYLE });
    expect(outliers.data).toEqual([
      [at('2026-08-17T10:00:00-03:00'), 0.31],
      [at('2026-08-22T10:00:00-03:00'), 0.9]
    ]);
  });

  it('desenha a faixa do Q1 ao Q3 e a linha da mediana com os valores do resumo', () => {
    const [, , iqr, median] = formatScatterOptions(tsqmi, histogram).series;

    expect(iqr.markArea?.data).toEqual([[{ yAxis: 0.5125 }, { yAxis: 0.6 }]]);
    expect(median.markLine?.data).toEqual([{ yAxis: 0.555 }]);
    expect(median.markLine?.label.formatter).toBe('Mediana 0,56');
  });

  it('tem a legenda "Análise", "Valor discrepante" e "Q1 a Q3"', () => {
    const { legend } = formatScatterOptions(tsqmi, histogram);

    expect(legend.data.map((item) => item.name)).toEqual(['Análise', 'Valor discrepante', 'Q1 a Q3']);
  });

  it('nos valores de 0 a 1, o eixo y vai de 0 a 1, e o x é de tempo', () => {
    const option = formatScatterOptions(tsqmi, histogram);

    expect(option.yAxis).toMatchObject({ type: 'value', min: 0, max: 1 });
    expect(option.xAxis.type).toBe('time');
    expect(option.xAxis.axisLabel.formatter(at('2026-08-17T10:00:00-03:00'))).toBe('17 ago');
  });

  it('com todas as análises no mesmo dia, abre o eixo um dia antes e um depois e mostra a data completa', () => {
    const day = 24 * 60 * 60 * 1000;
    const sameDay: DistributionEntity = {
      ...tsqmi,
      analyses: [
        { date: '2026-10-23T09:00:00-03:00', value: 0.9, is_outlier: false },
        { date: '2026-10-23T15:30:00-03:00', value: 0.88, is_outlier: false }
      ]
    };

    const { xAxis } = formatScatterOptions(sameDay, histogram);

    expect(xAxis).toMatchObject({
      type: 'time',
      min: at('2026-10-23T09:00:00-03:00') - day,
      max: at('2026-10-23T15:30:00-03:00') + day,
      minInterval: day
    });
    expect(xAxis.axisLabel.formatter(at('2026-10-23T00:00:00-03:00'))).toBe('23/10/2026');
    expect(xAxis.axisLabel.formatter(at('2026-10-24T00:00:00-03:00'))).toBe('24/10/2026');
  });

  it('esconde os rótulos de data que se sobrepõem, com uma folga para os que só se encostam', () => {
    const { axisLabel } = formatScatterOptions(tsqmi, histogram).xAxis;

    // sem fundo o ECharts mede só o texto: a folga só conta na caixa do rótulo com um fundo, mesmo transparente
    expect(axisLabel).toMatchObject({ hideOverlap: true, backgroundColor: 'transparent', padding: [0, 4] });
  });

  it('com análises em dias diferentes, o eixo segue as datas delas, com dia e mês', () => {
    const { xAxis } = formatScatterOptions(tsqmi, histogram);

    expect(xAxis).not.toHaveProperty('min');
    expect(xAxis).not.toHaveProperty('max');
    expect(xAxis.axisLabel.formatter(at('2026-08-17T10:00:00-03:00'))).toBe('17 ago');
  });

  it('numa métrica, o eixo y segue a escala dela', () => {
    const values = [42, 44, 47, 55, 63];
    const metric: DistributionEntity = {
      ...tsqmi,
      level: 'metric',
      metric_type: 'INT',
      analyses: values.map((value, index) => ({ date: `2026-08-1${index}T10:00:00-03:00`, value, is_outlier: false }))
    };

    const option = formatScatterOptions(metric, buildHistogram(values, 'metric', 'INT'));

    expect(option.yAxis).toMatchObject({ min: 40, max: 65 });
  });

  it('mostra a data e a hora e o valor com duas casas no tooltip', () => {
    const { tooltip } = formatScatterOptions(tsqmi, histogram);

    expect(tooltip.formatter({ value: [at('2026-08-17T10:00:00-03:00'), 0.31] })).toBe(
      '17/08/2026 às 10:00<br/><strong>0,31</strong>'
    );
  });

  it('descreve as análises, os quartis e os discrepantes no texto acessível', () => {
    expect(formatScatterOptions(tsqmi, histogram).aria.label.description).toBe(
      'Dispersão de TSQMI no tempo: 4 análises de 17 ago a 22 ago. Q1 0,51, mediana 0,56 e Q3 0,60. ' +
        '2 valores discrepantes: 0,31 em 17/08/2026, 0,90 em 22/08/2026.'
    );
  });

  it('sem discrepante, diz que não há nenhum; com muitos, lista os 10 primeiros', () => {
    const none = { ...tsqmi, analyses: tsqmi.analyses.map((analysis) => ({ ...analysis, is_outlier: false })) };
    const many = {
      ...tsqmi,
      analyses: Array.from({ length: 12 }, (_, index) => ({
        date: `2026-09-${String(index + 1).padStart(2, '0')}T10:00:00-03:00`,
        value: 0.1,
        is_outlier: true
      }))
    };

    expect(formatScatterOptions(none, histogram).aria.label.description).toMatch(/Nenhum valor discrepante\.$/);
    expect(formatScatterOptions(many, histogram).aria.label.description).toMatch(
      /12 valores discrepantes: 0,10 em 01\/09\/2026, .*0,10 em 10\/09\/2026 e mais 2\.$/
    );
  });
});

describe('boxplot do nível', () => {
  // q1, mediana e q3 de cada série pelo método inclusive, como o Service calcula
  function boxEntity(
    key: string,
    level: DistributionEntity['level'],
    values: number[],
    outliers: number[] = [],
    metricType: string | null = null
  ): DistributionEntity {
    const sorted = [...values].sort((a, b) => a - b);
    return {
      key,
      name: key === 'tsqmi' ? 'TSQMI' : key,
      level,
      metric_type: metricType,
      analyses: values.map((value, index) => ({
        date: `2026-08-${String(17 + index).padStart(2, '0')}T10:00:00-03:00`,
        value,
        is_outlier: outliers.includes(value)
      })),
      summary: {
        count: values.length,
        min: sorted[0] ?? null,
        p10: values.length ? sorted[0] : null,
        q1: values.length ? sorted[1] : null,
        median: values.length ? sorted[2] : null,
        q3: values.length ? sorted[3] : null,
        p90: values.length ? sorted[sorted.length - 1] : null,
        max: sorted[sorted.length - 1] ?? null,
        iqr: values.length ? sorted[3] - sorted[1] : null,
        lower_limit: null,
        upper_limit: null,
        outliers: outliers.length,
        mean: null,
        skewness: null
      }
    };
  }

  const tsqmi = boxEntity('tsqmi', 'tsqmi', [0.5, 0.55, 0.6, 0.62, 0.65]);
  const reliability = boxEntity('reliability', 'characteristic', [0.1, 0.7, 0.72, 0.75, 0.78], [0.1]);
  const maintainability = boxEntity('maintainability', 'characteristic', [0.6, 0.62, 0.64, 0.66, 0.68]);
  const functional = boxEntity('functional_suitability', 'characteristic', [0.4, 0.42, 0.44, 0.46, 0.95], [0.95]);
  const histogram = buildHistogram([0.5, 0.55, 0.6, 0.62, 0.65], 'tsqmi');

  describe('getLevelBoxplotRows', () => {
    it('põe a entidade escolhida primeiro e os filhos na ordem do Service', () => {
      const rows = getLevelBoxplotRows(tsqmi, [reliability, maintainability, functional]);

      expect(rows.map((row) => row.entity.key)).toEqual([
        'tsqmi',
        'reliability',
        'maintainability',
        'functional_suitability'
      ]);
      expect(rows[1].stats).toMatchObject({ low: 0.7, q1: 0.7, median: 0.72, q3: 0.75, high: 0.78 });
    });

    it('deixa de fora um filho sem análise', () => {
      const empty = boxEntity('maturity', 'subcharacteristic', []);
      const testing = boxEntity('testing_status', 'subcharacteristic', [0.6, 0.62, 0.64, 0.66, 0.68]);

      const rows = getLevelBoxplotRows(reliability, [empty, testing]);

      expect(rows.map((row) => row.entity.key)).toEqual(['reliability', 'testing_status']);
    });

    it('na medida, deixa de fora as métricas, que têm escala própria', () => {
      const measure = boxEntity('ci_feedback_time', 'measure', [0.5, 0.55, 0.6, 0.62, 0.65]);
      const metric = boxEntity('total_builds', 'metric', [42, 44, 47, 55, 63], [], 'INT');

      expect(getLevelBoxplotRows(measure, [metric]).map((row) => row.entity.key)).toEqual(['ci_feedback_time']);
    });

    it('sem filhos, como no nível métrica, só a linha da entidade', () => {
      const metric = boxEntity('total_builds', 'metric', [42, 44, 47, 55, 63], [], 'INT');

      expect(getLevelBoxplotRows(metric, []).map((row) => row.entity.key)).toEqual(['total_builds']);
    });
  });

  describe('formatLevelBoxplotOptions', () => {
    const rows = getLevelBoxplotRows(tsqmi, [reliability, maintainability, functional]);

    it('desenha uma caixa por linha, com a entidade em cor escura e os filhos em cor clara (CA6)', () => {
      const [boxplot] = formatLevelBoxplotOptions(rows, histogram).series;

      expect(boxplot.type).toBe('boxplot');
      expect(boxplot.data?.map((item) => item.value)).toEqual([
        [0.5, 0.55, 0.6, 0.62, 0.65],
        [0.7, 0.7, 0.72, 0.75, 0.78],
        [0.6, 0.62, 0.64, 0.66, 0.68],
        [0.4, 0.42, 0.44, 0.46, 0.46]
      ]);
      expect(boxplot.data?.[0].itemStyle.borderColor).toBe(DISTRIBUTION_COLORS.entityBox);
      expect(boxplot.data?.slice(1).map((item) => item.itemStyle.borderColor)).toEqual(
        Array(3).fill(DISTRIBUTION_COLORS.childBox)
      );
    });

    it('põe as linhas no eixo y de cima para baixo, com o nome da entidade em negrito', () => {
      const { yAxis } = formatLevelBoxplotOptions(rows, histogram);

      expect(yAxis).toMatchObject({
        type: 'category',
        inverse: true,
        data: ['tsqmi', 'reliability', 'maintainability', 'functional_suitability']
      });
      expect(yAxis.axisLabel.formatter('tsqmi', 0)).toBe('{chosen|TSQMI}');
      expect(yAxis.axisLabel.formatter('reliability', 1)).toBe('reliability');
    });

    it('destaca só o fundo da linha da entidade, sem repetir a cor nas faixas ímpares', () => {
      const { yAxis } = formatLevelBoxplotOptions(rows, histogram);

      expect(yAxis.splitArea.areaStyle.color).toEqual([
        DISTRIBUTION_COLORS.entityRow,
        'transparent',
        'transparent',
        'transparent'
      ]);
    });

    it('desenha os discrepantes de cada linha em círculo vazado, na linha deles', () => {
      const [, outliers] = formatLevelBoxplotOptions(rows, histogram).series;

      expect(outliers).toMatchObject({ type: 'scatter', name: 'Valor discrepante', ...OUTLIER_STYLE });
      expect(outliers.data).toEqual([
        [0.1, 'reliability'],
        [0.95, 'functional_suitability']
      ]);
    });

    it('mostra o valor e a data do discrepante no tooltip, e a caixa no tooltip do boxplot', () => {
      const [boxplot, outliers] = formatLevelBoxplotOptions(rows, histogram).series;

      expect(outliers.tooltip.formatter({ dataIndex: 0 })).toBe(
        `<span style="color:${DISTRIBUTION_COLORS.outlier};font-weight:bold">Valor discrepante</span><br/>` +
          'reliability<br/><strong>0,10</strong> em 17/08/2026 às 10:00'
      );
      expect(boxplot.tooltip.formatter({ dataIndex: 1 })).toBe(formatBoxTooltip(rows[1].stats, 'reliability'));
    });

    it('junta no mesmo ponto os discrepantes que se sobrepõem, com todos no tooltip', () => {
      const repeated = boxEntity('repeated', 'characteristic', [0.1, 0.1, 0.7, 0.72, 0.75], [0.1]);
      const [, outliers] = formatLevelBoxplotOptions(getLevelBoxplotRows(tsqmi, [repeated]), histogram).series;

      expect(outliers.data).toEqual([[0.1, 'repeated']]);
      expect(outliers.symbolSize(null, { dataIndex: 0 })).toBe(12);
      expect(outliers.tooltip.formatter({ dataIndex: 0 })).toContain('2 valores discrepantes');
    });

    it('usa o eixo do histograma: 0 a 1, ou a escala da métrica', () => {
      const metric = boxEntity('total_builds', 'metric', [42, 44, 47, 55, 63], [], 'INT');

      expect(formatLevelBoxplotOptions(rows, histogram).xAxis).toMatchObject({ min: 0, max: 1 });
      expect(
        formatLevelBoxplotOptions(
          getLevelBoxplotRows(metric, []),
          buildHistogram([42, 44, 47, 55, 63], 'metric', 'INT')
        ).xAxis
      ).toMatchObject({ min: 40, max: 65 });
    });

    it('tem o grid em px e a altura de uma faixa por linha, para alinhar com a tabela', () => {
      expect(formatLevelBoxplotOptions(rows, histogram).grid).toEqual(BOXPLOT_GRID);
      expect(getLevelBoxplotHeight(4)).toBe(BOXPLOT_GRID.top + 4 * BOXPLOT_ROW_HEIGHT + BOXPLOT_GRID.bottom);
    });

    it('num gráfico estreito, encurta os nomes e a margem direita, mantendo o topo e a base do grid', () => {
      const [narrow] = formatLevelBoxplotOptions(rows, histogram).media;

      expect(narrow.query).toEqual({ maxWidth: 360 });
      expect(narrow.option.grid).toEqual({ left: 68, right: 12 });
      expect(narrow.option.yAxis.axisLabel.width).toBe(56);
    });

    it('descreve as linhas e os discrepantes no texto acessível', () => {
      expect(formatLevelBoxplotOptions(rows.slice(0, 2), histogram).aria.label.description).toBe(
        'Boxplot de TSQMI e do filho no modelo, de 0 a 1. ' +
          'TSQMI: mediana 0,60, Q1 0,55 e Q3 0,62, nenhum valor discrepante; ' +
          'reliability: mediana 0,72, Q1 0,70 e Q3 0,75, 1 valor discrepante.'
      );
      expect(formatLevelBoxplotOptions(rows.slice(0, 1), histogram).aria.label.description).toMatch(
        /^Boxplot de TSQMI, de 0 a 1\. /
      );
    });
  });
});

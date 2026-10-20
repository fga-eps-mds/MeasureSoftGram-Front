import { MetricDistributionSummary } from '@customTypes/product';
import {
  DISTRIBUTION_COLORS,
  formatComparisonChartOptions,
  formatDistributionChartOptions,
  getPercentAxisMax,
  outlierSymbolSize,
  renderHistogramBar
} from '../formatDistributionCharts';
import { formatNumber, getBoxplotStats, getMetricReference } from '../metricDistribution';

// q1, mediana e q3 de [1..8, 30] pelo método inclusive, como o Service calcula
const summary: MetricDistributionSummary = {
  count: 9,
  min: 1,
  q1: 3,
  median: 5,
  q3: 7,
  max: 30,
  mean: 7.33,
  std_dev: 8.3
};
const files = [1, 2, 3, 4, 5, 6, 7, 8, 30].map((value) => ({ path: `src/f${value}.py`, value }));
const stats = getBoxplotStats(summary, files);

// comment_lines_density de 5 arquivos: q1 12, mediana 18 e q3 22, então 87 é outlier
const percentSummary: MetricDistributionSummary = {
  count: 5,
  min: 5,
  q1: 12,
  median: 18,
  q3: 22,
  max: 87,
  mean: 28.8,
  std_dev: 29.9
};
const percentFiles = [5, 12, 18, 22, 87].map((value) => ({ path: `src/p${value}.py`, value }));
const percentStats = getBoxplotStats(percentSummary, percentFiles);
const commentsReference = getMetricReference('comment_lines_density', {
  measure: 'commented_file_density',
  min_threshold: 10,
  max_threshold: 30
});

describe('formatDistributionChartOptions', () => {
  const options = formatDistributionChartOptions({ metric: 'complexity', files, stats, reference: null });

  it('desenha o histograma e o boxplot no mesmo eixo x, a partir do zero (CA3)', () => {
    expect(options.xAxis.map((axis) => [axis.gridIndex, axis.min, axis.max])).toEqual([
      [0, 0, 32],
      [1, 0, 32]
    ]);
    expect(options.grid.map((grid) => [grid.left, grid.right])).toEqual([
      [64, 32],
      [64, 32]
    ]);
    expect(options.xAxis[1]).toHaveProperty('name', 'complexity (complexidade ciclomática do arquivo)');
    const { axisLabel } = options.xAxis[1];
    expect('formatter' in axisLabel && axisLabel.formatter(1284)).toBe('1.284');
  });

  it('marca o eixo x a cada 2 faixas do histograma, nos dois gráficos', () => {
    // faixas de 2 (máximo 30): marcas de 4 em 4
    expect(options.xAxis.map((axis) => axis.interval)).toEqual([4, 4]);

    // complexity com máximo 87: faixas de 5, eixo até 90, marcas 0, 10, ..., 90
    const wide = [5, 12, 18, 22, 87].map((value) => ({ path: `src/c${value}.py`, value }));
    const wideStats = getBoxplotStats({ ...percentSummary, max: 87 }, wide);
    const complexity = formatDistributionChartOptions({
      metric: 'complexity',
      files: wide,
      stats: wideStats,
      reference: null
    });
    expect(complexity.xAxis.map((axis) => [axis.max, axis.interval])).toEqual([
      [90, 10],
      [90, 10]
    ]);

    // percentual: faixas de 5, eixo 0 a 100, marcas 0, 10, ..., 100
    const coverage = formatDistributionChartOptions({
      metric: 'comment_lines_density',
      files: percentFiles,
      stats: percentStats,
      reference: null
    });
    expect(coverage.xAxis.map((axis) => [axis.max, axis.interval])).toEqual([
      [100, 10],
      [100, 10]
    ]);
  });

  it('só reserva espaço para os rótulos da referência quando há referência', () => {
    const withReference = formatDistributionChartOptions({
      metric: 'comment_lines_density',
      files: percentFiles,
      stats: percentStats,
      reference: commentsReference
    });
    expect(withReference.grid.map((grid) => [grid.top, grid.height])).toEqual([
      [64, 200],
      [284, 44]
    ]);
    expect(options.grid[0].top).toBeLessThan(32);
    // o histograma ocupa o espaço que sobrou, sem encostar no boxplot
    expect(options.grid.map((grid) => [grid.top, grid.height])).toEqual([
      [16, 248],
      [284, 44]
    ]);
  });

  it('manda cada faixa como [início, fim, arquivos] para o histograma', () => {
    const [histogram] = options.series;

    expect(options.yAxis[0]).toMatchObject({ name: 'Arquivos', nameLocation: 'start', minInterval: 1 });
    // contagem em pt-BR, como no resumo: sem o formatter, o ECharts escreve "1,000"
    const countLabel = options.yAxis[0].axisLabel as { formatter: typeof formatNumber };
    expect(countLabel.formatter(1000)).toBe('1.000');
    expect(histogram).toMatchObject({ id: 'histogram', type: 'custom', encode: { x: [0, 1], y: 2 } });
    expect(histogram.data.slice(0, 2)).toEqual([
      [0, 2, 1],
      [2, 4, 2]
    ]);
    expect(histogram.tooltip.formatter({ dataIndex: 1 })).toBe('2 a 3<br/><strong>2 arquivos</strong>');
  });

  it('deita o boxplot de Tukey numa linha só e põe os outliers nela', () => {
    const [, boxplot, outliers] = options.series;

    expect(options.yAxis[1]).toMatchObject({ type: 'category', data: ['Boxplot'], axisLabel: { margin: 14 } });
    expect(boxplot).toMatchObject({ id: 'boxplot', type: 'boxplot', data: [[1, 3, 5, 7, 8]] });
    expect(outliers).toMatchObject({ id: 'outliers', type: 'scatter', data: [[30, 0]] });
    expect(outliers).toHaveProperty('symbolSize');
  });

  it('mostra a caixa e os bigodes no tooltip do boxplot', () => {
    expect(options.series[1].tooltip.formatter({ dataIndex: 0 })).toBe(
      '<strong>Boxplot</strong><br/>Bigode superior: 8<br/>3º quartil: 7<br/>Mediana: 5<br/>1º quartil: 3<br/>' +
        'Bigode inferior: 1'
    );
  });

  it('abre o tooltip ao passar o mouse ou clicar e deixa o mouse entrar nele (CA5)', () => {
    expect(options.tooltip).toMatchObject({
      trigger: 'item',
      triggerOn: 'mousemove|click',
      enterable: true,
      confine: true,
      hideDelay: 300
    });
  });

  it('limita a largura do tooltip e quebra caminhos longos, sem rolar a página', () => {
    expect(options.tooltip.extraCssText).toContain('max-width: 420px');
    expect(options.tooltip.extraCssText).toContain('white-space: normal');
    expect(options.tooltip.extraCssText).toContain('overflow-wrap: anywhere');
  });

  it('mostra o caminho e o valor do outlier no tooltip, com o HTML escapado', () => {
    const tricky = getBoxplotStats(summary, [...files.slice(0, 8), { path: 'src/<script>.py', value: 30 }]);
    const { series } = formatDistributionChartOptions({ metric: 'complexity', files, stats: tricky, reference: null });
    const tooltip = series[2].tooltip.formatter({ dataIndex: 0 });

    expect(tooltip).toContain('Outlier');
    expect(tooltip).toContain('<strong>src/&#60;script&#62;.py</strong>');
    expect(tooltip).toContain('complexity: 30');
    expect(tooltip).not.toContain('<script>');
  });

  it('junta os outliers do mesmo valor num ponto e lista todos os arquivos no tooltip (CA5)', () => {
    const tied = getBoxplotStats(summary, [...files, { path: 'src/g30.py', value: 30 }]);
    const { series } = formatDistributionChartOptions({ metric: 'complexity', files, stats: tied, reference: null });
    const tooltip = series[2].tooltip.formatter({ dataIndex: 0 });

    expect(series[2].data).toEqual([[30, 0]]);
    expect(tooltip).toContain('2 outliers');
    expect(tooltip).toContain('<strong>src/f30.py</strong>');
    expect(tooltip).toContain('<strong>src/g30.py</strong>');
  });

  it('não corta a lista de arquivos de um ponto com muitos outliers', () => {
    const many = Array.from({ length: 12 }, (_, index) => ({ path: `src/m${index}.py`, value: 30 }));
    const crowded = getBoxplotStats(summary, [...files.slice(0, 8), ...many]);
    const { series } = formatDistributionChartOptions({ metric: 'complexity', files, stats: crowded, reference: null });
    const tooltip = series[2].tooltip.formatter({ dataIndex: 0 });

    expect(tooltip).toContain('12 outliers');
    expect(tooltip.match(/<strong>/g)).toHaveLength(12);
    expect(tooltip).toContain('overflow-y:auto');
  });

  it('junta outliers muito próximos e mostra o valor de cada arquivo', () => {
    const close = getBoxplotStats(summary, [...files, { path: 'src/h30.py', value: 30.4 }]);
    const { series } = formatDistributionChartOptions({ metric: 'complexity', files, stats: close, reference: null });
    const tooltip = series[2].tooltip.formatter({ dataIndex: 0 });

    expect(series[2].data).toEqual([[30.2, 0]]);
    expect(tooltip).toContain('<strong>src/h30.py</strong>: 30,4');
    expect(tooltip).toContain('complexity: 30 a 30,4');
  });

  it('mostra a posição de cada arquivo quando o ponto atravessa um limite de referência', () => {
    // q1 90 e q3 98: a cerca de baixo fica em 78, e 59,5 e 60,5 viram um ponto só, dos dois lados do mínimo de 60%
    const coverageSummary: MetricDistributionSummary = {
      count: 10,
      min: 59.5,
      q1: 90,
      median: 95,
      q3: 98,
      max: 100,
      mean: 88.8,
      std_dev: 14.2
    };
    const crossing = [59.5, 60.5, 90, 92, 95, 96, 97, 98, 99, 100].map((value) => ({
      path: `src/c${value}.py`,
      value
    }));
    const { series } = formatDistributionChartOptions({
      metric: 'coverage',
      files: crossing,
      stats: getBoxplotStats(coverageSummary, crossing),
      reference: getMetricReference('coverage', { measure: 'test_coverage', min_threshold: 60, max_threshold: 100 })
    });
    const tooltip = series[2].tooltip.formatter({ dataIndex: 0 });

    expect(series[2].data).toEqual([[60, 0]]);
    expect(tooltip).toContain('<strong>src/c59.5.py</strong>: 59,5% · Abaixo do mínimo de referência (60%)');
    expect(tooltip).toContain('<strong>src/c60.5.py</strong>: 60,5% · Dentro da faixa de referência');
  });

  it('não desenha linha de referência sem faixa', () => {
    expect(options.series[0].markLine).toBeUndefined();
    expect(options.series[1].markLine).toBeUndefined();
  });

  it('desenha o mínimo e o máximo de referência tracejados nos dois gráficos (CA4)', () => {
    const percent = formatDistributionChartOptions({
      metric: 'comment_lines_density',
      files: percentFiles,
      stats: percentStats,
      reference: commentsReference
    });
    const [histogram, boxplot, outliers] = percent.series;

    expect(percent.xAxis[0].max).toBe(100);
    expect(histogram.markLine).toMatchObject({
      silent: true,
      symbol: 'none',
      lineStyle: { type: 'dashed' },
      label: { position: 'end', rich: { value: { fontWeight: 'bold' }, measure: { fontSize: 10 } } }
    });
    expect(histogram.markLine?.data).toEqual([
      { xAxis: 10, label: { formatter: 'Mín. de referência = 10%', align: 'left', distance: [0, 6] } },
      {
        xAxis: 30,
        label: {
          formatter: '{value|Máx. de referência = 30%}\n{measure|medida: Densidade de arquivos comentados}',
          align: 'left',
          distance: [0, 30]
        }
      }
    ]);
    expect(boxplot.markLine).toMatchObject({ label: { show: false }, data: [{ xAxis: 10 }, { xAxis: 30 }] });
    expect(outliers.tooltip.formatter({ dataIndex: 0 })).toContain('Acima do máximo de referência (30%)');
  });

  it('alinha o rótulo à direita quando a linha fica na metade direita do eixo', () => {
    const coverage = formatDistributionChartOptions({
      metric: 'coverage',
      files: percentFiles,
      stats: percentStats,
      reference: getMetricReference('coverage', { measure: 'test_coverage', min_threshold: 60, max_threshold: 100 })
    });

    expect(coverage.series[0].markLine?.data).toMatchObject([
      { label: { align: 'right' } },
      { label: { align: 'right' } }
    ]);
  });

  it('sem arquivos, leva o eixo até o bigode de cima', () => {
    const empty = formatDistributionChartOptions({ metric: 'complexity', files: [], stats, reference: null });

    expect(empty.xAxis[0].max).toBe(8);
    expect(empty.series[0].data).toEqual([]);
  });

  it('descreve o gráfico para leitores de tela', () => {
    expect(options.aria).toEqual({
      enabled: true,
      label: {
        description: 'Histograma e boxplot de complexity: 9 arquivos, mediana 5, 1 outlier. Outliers: src/f30.py (30).'
      }
    });
  });

  it('lista na descrição até 10 outliers, do mais distante da mediana, e conta os demais', () => {
    const many = Array.from({ length: 13 }, (_, index) => ({ path: `src/m${index}.py`, value: 20 + index }));
    const crowded = getBoxplotStats(summary, [...files.slice(0, 8), ...many]);
    const { description } = formatDistributionChartOptions({
      metric: 'complexity',
      files,
      stats: crowded,
      reference: null
    }).aria.label;

    expect(description).toContain('13 outliers. Outliers: src/m12.py (32), src/m11.py (31),');
    expect(description).toContain('src/m3.py (23) e mais 3.');
    expect(description).not.toContain('src/m2.py');
  });
});

describe('outlierSymbolSize', () => {
  it('aumenta o ponto que junta mais de um arquivo', () => {
    const symbolSize = outlierSymbolSize([
      { value: 30, files: [{ path: 'src/a.py', value: 30 }] },
      {
        value: 40,
        files: [
          { path: 'src/b.py', value: 40 },
          { path: 'src/c.py', value: 40 }
        ]
      }
    ]);

    expect(symbolSize(null, { dataIndex: 0 })).toBe(9);
    expect(symbolSize(null, { dataIndex: 1 })).toBe(12);
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

describe('formatComparisonChartOptions', () => {
  const repositories = [
    { name: 'service', summary, files },
    { name: 'core', summary: { ...summary, count: 138, median: 4 }, files: files.slice(0, 8) }
  ];
  const options = formatComparisonChartOptions('complexity', repositories);

  it('arredonda a mediana do rótulo de 10 para cima, para caber com muitos repositórios num gráfico estreito', () => {
    const coverage = formatComparisonChartOptions('coverage', [
      { name: 'service', summary: { ...summary, median: 87.6 }, files }
    ]);

    expect(coverage.xAxis.axisLabel.formatter('service', 0)).toBe('{name|service}\n{meta|n = 9}\n{meta|mediana 88%}');
    expect(coverage.aria.label.description).toContain('service: mediana 87,6%');
  });

  it('mantém a casa decimal da mediana abaixo de 10, para não esconder valores pequenos', () => {
    const duplication = formatComparisonChartOptions('duplicated_lines_density', [
      { name: 'service', summary: { ...summary, median: 0.44 }, files }
    ]);

    expect(duplication.xAxis.axisLabel.formatter('service', 0)).toBe(
      '{name|service}\n{meta|n = 9}\n{meta|mediana 0,4%}'
    );
  });

  it('desenha um boxplot por repositório, com o nome, o n e a mediana embaixo (CA6)', () => {
    expect(options.xAxis.data).toEqual(['service', 'core']);
    expect(options.xAxis.axisLabel.formatter('core', 1)).toBe('{name|core}\n{meta|n = 138}\n{meta|mediana 4}');
    expect(options.yAxis).toMatchObject({ name: 'complexity', nameLocation: 'start' });
    expect(options.series[0]).toMatchObject({
      id: 'boxplot',
      type: 'boxplot',
      data: [
        [1, 3, 5, 7, 8],
        [1, 3, 4, 7, 8]
      ]
    });
  });

  it('põe os outliers na coluna do repositório e mostra o arquivo no tooltip', () => {
    const tooltip = options.series[1].tooltip.formatter({ dataIndex: 0 });

    expect(options.series[1]).toMatchObject({ id: 'outliers', type: 'scatter', data: [[0, 30]] });
    expect(tooltip).toContain('service');
    expect(tooltip).toContain('<strong>src/f30.py</strong>');
  });

  it('junta os outliers do mesmo valor em cada repositório', () => {
    const tied = formatComparisonChartOptions('complexity', [
      { name: 'service', summary, files: [...files, { path: 'src/g30.py', value: 30 }] }
    ]);

    expect(tied.series[1].data).toEqual([[0, 30]]);
    expect(tied.series[1].tooltip.formatter({ dataIndex: 0 })).toContain('2 outliers');
  });

  it('mostra a caixa do repositório no tooltip do boxplot', () => {
    expect(options.series[0].tooltip.formatter({ dataIndex: 1 })).toContain('<strong>core</strong>');
  });

  it('mantém os percentuais na escala de 0 a 100', () => {
    expect(formatComparisonChartOptions('coverage', repositories).yAxis.max).toBe(getPercentAxisMax);
    expect(getPercentAxisMax({ max: 87 })).toBe(100);
    expect(getPercentAxisMax({ max: 120 })).toBe(120);
    expect(options.yAxis.max).toBeUndefined();
  });

  it('tira dos rótulos o prefixo comum aos repositórios; o nome inteiro fica no tooltip', () => {
    const msg = formatComparisonChartOptions('complexity', [
      { name: '2026.2-MeasureSoftGram-Service', summary, files },
      { name: '2026.2-MeasureSoftGram-Front', summary, files }
    ]);

    expect(msg.xAxis.axisLabel.formatter('2026.2-MeasureSoftGram-Service', 0)).toBe(
      '{name|Service}\n{meta|n = 9}\n{meta|mediana 5}'
    );
    expect(msg.xAxis.axisLabel.formatter('2026.2-MeasureSoftGram-Front', 1)).toBe(
      '{name|Front}\n{meta|n = 9}\n{meta|mediana 5}'
    );
    expect(msg.series[0].tooltip.formatter({ dataIndex: 0 })).toContain(
      '<strong>2026.2-MeasureSoftGram-Service</strong>'
    );
  });

  it('encurta pelo meio o nome que continua longo e tira as chaves do rótulo', () => {
    const long = formatComparisonChartOptions('complexity', [
      { name: '2026.2-MeasureSoftGram-Service', summary, files }
    ]);
    const sameEnd = formatComparisonChartOptions('complexity', [
      { name: 'acme-payments-gateway-service-backend', summary, files },
      { name: 'acme-orders-gateway-service-backend', summary, files }
    ]);

    expect(long.xAxis.axisLabel.formatter('2026.2-MeasureSoftGram-Service', 0)).toBe(
      '{name|2026.2-Me…-Service}\n{meta|n = 9}\n{meta|mediana 5}'
    );
    expect(sameEnd.xAxis.axisLabel.formatter('acme-payments-gateway-service-backend', 0)).toContain(
      '{name|payments-…-backend}'
    );
    expect(sameEnd.xAxis.axisLabel.formatter('acme-orders-gateway-service-backend', 1)).toContain(
      '{name|orders-ga…-backend}'
    );
    expect(options.xAxis.axisLabel.formatter('a{b}', 0)).toBe('{name|ab}\n{meta|n = 9}\n{meta|mediana 5}');
  });

  it('desenha as linhas de referência na comparação (CA4)', () => {
    const coverageReference = getMetricReference('coverage', {
      measure: 'test_coverage',
      min_threshold: 60,
      max_threshold: 100
    });
    const coverage = formatComparisonChartOptions('coverage', repositories, coverageReference);

    expect(coverage.series[0].markLine).toMatchObject({
      lineStyle: { type: 'dashed' },
      label: { position: 'end' },
      data: [
        { yAxis: 60, label: { formatter: 'Mín. 60%' } },
        { yAxis: 100, label: { formatter: 'Máx. 100%' } }
      ]
    });
    expect(coverage.grid.right).toBe(96);
    expect(coverage.series[1].tooltip.formatter({ dataIndex: 0 })).toContain('Abaixo do mínimo de referência (60%)');
    expect(options.series[0].markLine).toBeUndefined();
    expect(options.grid.right).toBe(32);
  });

  it('descreve o gráfico para leitores de tela, com o termo do provedor e os outliers de quem os tem', () => {
    expect(options.aria.label.description).toBe(
      'Um boxplot de complexity por repositório. service: mediana 5, outliers: src/f30.py (30); core: mediana 4.'
    );
    expect(formatComparisonChartOptions('complexity', repositories, null, 'projeto').aria.label.description).toContain(
      'por projeto.'
    );
  });
});

import { distribution, entity, summary } from '@pages/products/[product]/dashboards/distribuicao/tests/fixtures';
import { buildDensity } from '../distributionDensity';
import { csvFileName, toCsv } from '../exportCsv';
import {
  DISTRIBUTION_CSV,
  formatBoxplotCsv,
  formatDensityCsv,
  formatDistributionCsvs,
  formatHistogramCsv,
  formatScatterCsv,
  formatSummaryCsv
} from '../formatDistributionCsv';

const FILTER_TITLES = ['Release', 'Repositório', 'Nível', 'Entidade'];
const TSQMI_FILTERS = { release: 'R2', repository: 'MeasureSoftGram-Service', level: 'TSQMI', entity: 'TSQMI' };

/** Uma métrica INT do GitHub, com a escala própria (eixo de 40 a 65 em faixas de 5). */
const metric = () =>
  distribution({
    level: 'metric',
    key: 'sum_ci_feedback_times',
    main: entity('sum_ci_feedback_times', 'sum_ci_feedback_times', 'metric', [42, 44, 47, 55, 63], 'INT'),
    children: []
  });

/** Uma característica com um filho com análise e outro sem. */
const characteristic = () =>
  distribution({
    level: 'characteristic',
    key: 'reliability',
    main: entity('reliability', 'Reliability', 'characteristic'),
    children: [
      entity('testing_status', 'Testing Status', 'subcharacteristic'),
      entity('maturity', 'Maturity', 'subcharacteristic', [])
    ]
  });

/** Uma medida cujos filhos são métricas, de outra escala. */
const measure = () =>
  distribution({
    level: 'measure',
    key: 'passed_tests',
    main: entity('passed_tests', 'Passed Tests', 'measure'),
    children: [entity('tests', 'tests', 'metric', [10, 12, 15], 'INT')]
  });

/** Duas análises só: sem curva de densidade e sem assimetria, como o Service devolve. */
const fewAnalyses = () =>
  distribution({
    main: { ...entity('tsqmi', 'TSQMI', 'tsqmi', [0.5, 0.6]), summary: { ...summary, count: 2, skewness: null } }
  });

describe('formatDistributionCsv', () => {
  it('nomeia os arquivos como msgram-distribuicao-<quadro>-<data>.csv', () => {
    const date = new Date(2026, 9, 23);
    const names = [
      DISTRIBUTION_CSV.histogram,
      DISTRIBUTION_CSV.density,
      DISTRIBUTION_CSV.boxplot,
      DISTRIBUTION_CSV.scatter,
      DISTRIBUTION_CSV.summary
    ];

    expect(names.map((name) => csvFileName(DISTRIBUTION_CSV.dashboard, name, date))).toEqual([
      'msgram-distribuicao-histograma-2026-10-23.csv',
      'msgram-distribuicao-densidade-2026-10-23.csv',
      'msgram-distribuicao-boxplot-2026-10-23.csv',
      'msgram-distribuicao-dispersao-2026-10-23.csv',
      'msgram-distribuicao-resumo-2026-10-23.csv'
    ]);
  });

  it('começa todo CSV com a release, o repositório, o nível e a entidade da tela', () => {
    const charts = formatDistributionCsvs(distribution());

    Object.values(charts).forEach((chart) => {
      expect(chart.columns.slice(0, 4).map((column) => column.title)).toEqual(FILTER_TITLES);
      expect(chart.rows[0]).toMatchObject(TSQMI_FILTERS);
    });
    expect(Object.values(charts).map((chart) => chart.name)).toEqual([
      'histograma',
      'densidade',
      'boxplot',
      'dispersao',
      'resumo'
    ]);
  });

  describe('histograma', () => {
    it('traz as 10 faixas de 0,10 da tela, inclusive as vazias, com a quantidade de análises', () => {
      const chart = formatHistogramCsv(distribution());

      expect(chart.columns.map((column) => column.title)).toEqual([
        ...FILTER_TITLES,
        'Início da faixa',
        'Fim da faixa',
        'Quantidade de análises'
      ]);
      expect(chart.rows.map((row) => [row.start, row.end, row.count])).toEqual([
        [0, 0.1, 0],
        [0.1, 0.2, 0],
        [0.2, 0.3, 0],
        [0.3, 0.4, 1],
        [0.4, 0.5, 0],
        [0.5, 0.6, 3],
        [0.6, 0.7, 1],
        [0.7, 0.8, 0],
        [0.8, 0.9, 0],
        [0.9, 1, 1]
      ]);
    });

    it('numa métrica, segue as faixas da escala dela', () => {
      const chart = formatHistogramCsv(metric());

      expect(chart.rows[0]).toMatchObject({
        release: 'R2',
        repository: 'MeasureSoftGram-Service',
        level: 'Métrica',
        entity: 'sum_ci_feedback_times'
      });
      expect(chart.rows.map((row) => [row.start, row.end, row.count])).toEqual([
        [40, 45, 2],
        [45, 50, 1],
        [50, 55, 0],
        [55, 60, 1],
        [60, 65, 1]
      ]);
    });
  });

  describe('densidade', () => {
    it('traz os pontos da curva desenhada, de 0 a 1, sem arredondar', () => {
      const data = distribution();
      const chart = formatDensityCsv(data);
      const expected = buildDensity(
        data.entity.analyses.map((analysis) => analysis.value),
        { min: 0, max: 1, iqr: summary.iqr }
      );

      expect(chart.columns.map((column) => column.title)).toEqual([...FILTER_TITLES, 'Valor', 'Densidade']);
      expect(chart.rows).toHaveLength(120);
      expect(chart.rows.map((row) => [row.value, row.density])).toEqual(expected?.map((point) => [point.x, point.y]));
      expect(chart.rows[0].value).toBe(0);
      expect(chart.rows[119].value).toBe(1);
      // o valor vai como foi calculado, não com as duas casas da tela
      expect(chart.rows[60].density).not.toBe(Number(chart.rows[60].density.toFixed(2)));
    });

    it('numa métrica, vai do início ao fim do eixo da métrica', () => {
      const chart = formatDensityCsv(metric());

      expect(chart.rows[0]).toMatchObject({ level: 'Métrica', value: 40 });
      expect(chart.rows[119].value).toBe(65);
    });

    it('fica sem linhas com menos de 3 análises', () => {
      expect(formatDensityCsv(fewAnalyses()).rows).toEqual([]);
    });
  });

  describe('boxplot', () => {
    it('traz a entidade escolhida e os filhos com análise, cada um com o próprio nível e os percentis do Service', () => {
      const chart = formatBoxplotCsv(characteristic());

      expect(chart.columns.map((column) => column.title)).toEqual([
        ...FILTER_TITLES,
        'P10',
        'Q1',
        'Mediana',
        'Q3',
        'P90',
        'IQR',
        'Limite inferior',
        'Limite superior',
        'Quantidade de discrepantes'
      ]);
      expect(chart.rows.map((row) => [row.level, row.entity])).toEqual([
        ['Característica', 'Reliability'],
        ['Subcaracterística', 'Testing Status']
      ]);
      expect(chart.rows[0]).toEqual({
        release: 'R2',
        repository: 'MeasureSoftGram-Service',
        level: 'Característica',
        entity: 'Reliability',
        p10: 0.385,
        q1: 0.5125,
        median: 0.555,
        q3: 0.6,
        p90: 0.75,
        iqr: 0.0875,
        lower_limit: 0.38125,
        upper_limit: 0.73125,
        outliers: 2
      });
    });

    it('no nível medida, só a linha da medida, como na tela: as métricas têm outra escala', () => {
      expect(formatBoxplotCsv(measure()).rows.map((row) => [row.level, row.entity])).toEqual([
        ['Medida', 'Passed Tests']
      ]);
    });

    it('no nível métrica, só a linha da métrica', () => {
      expect(formatBoxplotCsv(metric()).rows.map((row) => [row.level, row.entity])).toEqual([
        ['Métrica', 'sum_ci_feedback_times']
      ]);
    });
  });

  describe('dispersão', () => {
    it('traz uma linha por análise, na ordem de data, com o valor e se é discrepante', () => {
      const chart = formatScatterCsv(distribution());

      expect(chart.columns.map((column) => column.title)).toEqual([
        ...FILTER_TITLES,
        'Data da análise',
        'Valor',
        'Discrepante'
      ]);
      expect(chart.rows.map((row) => [row.date, row.value, row.outlier])).toEqual([
        ['2026-08-17T10:00:00-03:00', 0.31, 'sim'],
        ['2026-08-18T10:00:00-03:00', 0.52, 'não'],
        ['2026-08-19T10:00:00-03:00', 0.55, 'não'],
        ['2026-08-20T10:00:00-03:00', 0.56, 'não'],
        ['2026-08-21T10:00:00-03:00', 0.6, 'não'],
        ['2026-08-22T10:00:00-03:00', 0.9, 'sim']
      ]);
    });

    it('numa métrica, leva o valor bruto', () => {
      const chart = formatScatterCsv(metric());

      expect(chart.rows.map((row) => row.value)).toEqual([42, 44, 47, 55, 63]);
      expect(chart.rows[0]).toMatchObject({ level: 'Métrica', entity: 'sum_ci_feedback_times' });
    });
  });

  describe('resumo', () => {
    it('traz uma linha por estatística da tela, na ordem dela, sem arredondar', () => {
      const chart = formatSummaryCsv(distribution());

      expect(chart.columns.map((column) => column.title)).toEqual([...FILTER_TITLES, 'Estatística', 'Valor']);
      expect(chart.rows.map((row) => [row.statistic, row.value])).toEqual([
        ['Análises', 6],
        ['Mínimo', 0.31],
        ['Q1 (1º quartil)', 0.5125],
        ['Mediana', 0.555],
        ['Q3 (3º quartil)', 0.6],
        ['Máximo', 0.9],
        ['IQR (Q3 − Q1)', 0.0875],
        ['Limite inferior', 0.38125],
        ['Limite superior', 0.73125],
        ['Discrepantes', 2],
        ['Média', 0.5716666],
        ['Assimetria', 0.48]
      ]);
    });

    it('com menos de 3 análises, a assimetria fica vazia, como na tela', () => {
      const chart = formatSummaryCsv(fewAnalyses());

      expect(chart.rows.find((row) => row.statistic === 'Assimetria')?.value).toBeNull();
      expect(toCsv(chart).split('\r\n').at(-1)).toBe('R2,MeasureSoftGram-Service,TSQMI,TSQMI,Assimetria,');
    });
  });

  it('escreve os valores no CSV como o Service devolve, com ponto e todas as casas', () => {
    const charts = formatDistributionCsvs(characteristic());

    expect(toCsv(charts.summary).split('\r\n').slice(0, 2)).toEqual([
      'Release,Repositório,Nível,Entidade,Estatística,Valor',
      'R2,MeasureSoftGram-Service,Característica,Reliability,Análises,6'
    ]);
    expect(toCsv(charts.summary).split('\r\n')[11]).toBe(
      'R2,MeasureSoftGram-Service,Característica,Reliability,Média,0.5716666'
    );
    expect(toCsv(charts.boxplot).split('\r\n')[2]).toBe(
      'R2,MeasureSoftGram-Service,Subcaracterística,Testing Status,0.385,0.5125,0.555,0.6,0.75,0.0875,0.38125,0.73125,2'
    );
    expect(toCsv(charts.histogram).split('\r\n')[4]).toBe(
      'R2,MeasureSoftGram-Service,Característica,Reliability,0.3,0.4,1'
    );
    expect(toCsv(charts.scatter).split('\r\n')[1]).toBe(
      'R2,MeasureSoftGram-Service,Característica,Reliability,2026-08-17T10:00:00-03:00,0.31,sim'
    );
  });
});

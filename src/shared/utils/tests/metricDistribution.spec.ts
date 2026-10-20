import { FileMetricKey, MetricDistributionRepository, MetricDistributionSummary } from '@customTypes/product';
import {
  buildHistogramBins,
  describeReferencePosition,
  FILE_METRICS,
  formatBinLabel,
  formatExcludedFiles,
  formatFileCount,
  formatMetricValue,
  formatNumber,
  formatOutlierCount,
  getBinWidth,
  getBoxplotStats,
  getComparisonMissingDataMessage,
  getFileMetric,
  getMeasureName,
  getMetricReference,
  getMissingDataMessage,
  getOutlierFences,
  getSummaryRows,
  groupOutliers
} from '../metricDistribution';

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
const commentsReference = { measure: 'commented_file_density', min_threshold: 10, max_threshold: 30 };

describe('metricDistribution', () => {
  describe('catálogo de métricas', () => {
    it('lista as seis métricas coletadas por arquivo, com o tipo do SonarQube', () => {
      expect(FILE_METRICS.map((metric) => [metric.key, metric.kind])).toEqual([
        ['complexity', 'count'],
        ['functions', 'count'],
        ['coverage', 'percent'],
        ['comment_lines_density', 'percent'],
        ['duplicated_lines_density', 'percent'],
        ['sqale_debt_ratio', 'percent']
      ]);
    });

    it('acha a métrica pela chave e cai na complexidade com uma chave desconhecida', () => {
      expect(getFileMetric('coverage').description).toBe('% de cobertura de testes do arquivo');
      expect(getFileMetric('desconhecida' as FileMetricKey).key).toBe('complexity');
    });
  });

  describe('referência (CA4)', () => {
    it('mantém a faixa das medidas que usam a métrica diretamente, com o nome da medida', () => {
      expect(getMetricReference('comment_lines_density', commentsReference)).toEqual({
        ...commentsReference,
        measureName: 'Densidade de arquivos comentados'
      });
    });

    it.each<FileMetricKey>(['complexity', 'functions'])(
      'descarta a faixa de non_complex_file_density em %s, que vale para a razão entre as duas',
      (metric) => {
        expect(
          getMetricReference(metric, { measure: 'non_complex_file_density', min_threshold: 0, max_threshold: 10 })
        ).toBeNull();
      }
    );

    it('fica sem faixa quando o Service não devolve uma', () => {
      expect(getMetricReference('coverage', null)).toBeNull();
      expect(getMetricReference('coverage', undefined)).toBeNull();
    });

    it('usa a chave legível para uma medida sem nome em português', () => {
      expect(getMeasureName('test_coverage')).toBe('Cobertura de testes');
      expect(getMeasureName('nova_medida')).toBe('nova medida');
    });
  });

  describe('outliers e bigodes (CA5)', () => {
    it('calcula as cercas a 1,5 × IQR dos quartis', () => {
      expect(getOutlierFences(summary)).toEqual({ lower: -3, upper: 13 });
    });

    it('marca só o arquivo fora das cercas e leva os bigodes até o último valor dentro delas', () => {
      expect(getBoxplotStats(summary, files)).toEqual({
        low: 1,
        q1: 3,
        median: 5,
        q3: 7,
        high: 8,
        outliers: [{ path: 'src/f30.py', value: 30 }]
      });
    });

    it('não marca o valor que cai exatamente na cerca', () => {
      const stats = getBoxplotStats(summary, [...files.slice(0, 8), { path: 'src/limite.py', value: 13 }]);

      expect(stats.outliers).toEqual([]);
      expect(stats.high).toBe(13);
    });

    it('ordena os outliers do menor para o maior', () => {
      const stats = getBoxplotStats(summary, [
        { path: 'src/b.py', value: 40 },
        { path: 'src/a.py', value: -10 },
        ...files.slice(0, 8)
      ]);

      expect(stats.outliers.map((file) => file.value)).toEqual([-10, 40]);
    });

    it('sem arquivos, usa o mínimo e o máximo do resumo nos bigodes', () => {
      expect(getBoxplotStats(summary, [])).toMatchObject({ low: 1, high: 30, outliers: [] });
    });

    it('não deixa o bigode de baixo entrar na caixa', () => {
      // [0, 0, 100 × 6]: q1 = 75 pelo método inclusive e os dois zeros são outliers
      const coverage = { count: 8, min: 0, q1: 75, median: 100, q3: 100, max: 100, mean: 75, std_dev: 43.3 };
      const values = [0, 0, 100, 100, 100, 100, 100, 100].map((value, index) => ({ path: `src/c${index}.py`, value }));

      expect(getBoxplotStats(coverage, values)).toMatchObject({ low: 75, high: 100 });
    });

    it('não deixa o bigode de cima entrar na caixa', () => {
      // [1 × 6, 50, 50]: q3 = 13,25 pelo método inclusive e os dois 50 são outliers
      const complexity = { count: 8, min: 1, q1: 1, median: 1, q3: 13.25, max: 50, mean: 13.25, std_dev: 21.2 };
      const values = [1, 1, 1, 1, 1, 1, 50, 50].map((value, index) => ({ path: `src/x${index}.py`, value }));

      expect(getBoxplotStats(complexity, values)).toMatchObject({ low: 1, high: 13.25 });
    });
  });

  describe('agrupamento dos outliers (CA5)', () => {
    it('junta os arquivos com o mesmo valor num ponto só', () => {
      const groups = groupOutliers([
        { path: 'src/a.py', value: 30 },
        { path: 'src/b.py', value: 30 },
        { path: 'src/c.py', value: 40 }
      ]);

      expect(groups).toEqual([
        {
          value: 30,
          files: [
            { path: 'src/a.py', value: 30 },
            { path: 'src/b.py', value: 30 }
          ]
        },
        { value: 40, files: [{ path: 'src/c.py', value: 40 }] }
      ]);
    });

    it('junta os valores próximos dentro da tolerância e põe o ponto no meio deles', () => {
      const groups = groupOutliers(
        [
          { path: 'src/a.py', value: 0.1 },
          { path: 'src/b.py', value: 0.3 },
          { path: 'src/c.py', value: 5 }
        ],
        1.5
      );

      expect(groups.map((group) => [group.value, group.files.length])).toEqual([
        [0.2, 2],
        [5, 1]
      ]);
    });

    it('com IQR zero, todo arquivo fora do quartil é outlier e os repetidos se juntam', () => {
      // duplicated_lines_density com a maioria dos arquivos em 0%: q1 = q3 = 0
      const duplication = { count: 8, min: 0, q1: 0, median: 0, q3: 0, max: 100, mean: 26.9, std_dev: 41.6 };
      const values = [0, 0, 0, 0, 3.5, 12.4, 100, 100].map((value, index) => ({ path: `src/d${index}.py`, value }));
      const { outliers } = getBoxplotStats(duplication, values);

      expect(outliers.map((file) => file.value)).toEqual([3.5, 12.4, 100, 100]);
      expect(groupOutliers(outliers).map((group) => group.files.length)).toEqual([1, 1, 2]);
    });
  });

  describe('histograma (CA3)', () => {
    it('usa faixas de 5 pontos de 0 a 100 nos percentuais', () => {
      const bins = buildHistogramBins([0, 4.9, 5, 99.5, 100], 'percent');

      expect(bins).toHaveLength(20);
      expect(bins[0]).toEqual({ start: 0, end: 5, count: 2 });
      expect(bins[1]).toEqual({ start: 5, end: 10, count: 1 });
      expect(bins[19]).toEqual({ start: 95, end: 100, count: 2 });
    });

    it('alarga o eixo quando um percentual passa de 100', () => {
      const bins = buildHistogramBins([120], 'percent');

      expect(bins).toHaveLength(24);
      expect(bins[23]).toEqual({ start: 115, end: 120, count: 1 });
    });

    it('agrupa contagens em faixas de inteiros, com até 20 faixas a partir do zero', () => {
      const bins = buildHistogramBins(
        files.map((file) => file.value),
        'count'
      );

      expect(getBinWidth('count', 30)).toBe(2);
      expect(bins).toHaveLength(16);
      expect(bins.slice(0, 5).map((bin) => bin.count)).toEqual([1, 2, 2, 2, 1]);
      expect(bins[15]).toEqual({ start: 30, end: 32, count: 1 });
    });

    it('usa faixas de largura 1 quando as contagens são pequenas', () => {
      expect(buildHistogramBins([0, 0, 3], 'count').map((bin) => bin.count)).toEqual([2, 0, 0, 1]);
    });

    it('não monta faixas sem valores', () => {
      expect(buildHistogramBins([], 'count')).toEqual([]);
    });
  });

  describe('formatação', () => {
    it('escreve números com até uma casa decimal, em pt-BR', () => {
      expect(formatNumber(10.44)).toBe('10,4');
      expect(formatNumber(1284)).toBe('1.284');
      expect(formatMetricValue(87, 'percent')).toBe('87%');
      expect(formatMetricValue(7, 'count')).toBe('7');
    });

    it('descreve a faixa do histograma', () => {
      expect(formatBinLabel({ start: 5, end: 10, count: 3 }, 'count')).toBe('5 a 9');
      expect(formatBinLabel({ start: 7, end: 8, count: 3 }, 'count')).toBe('7');
      expect(formatBinLabel({ start: 10, end: 15, count: 3 }, 'percent')).toBe('10% a 15%');
    });

    it('conta arquivos e outliers no singular e no plural', () => {
      expect(formatFileCount(1)).toBe('1 arquivo');
      expect(formatFileCount(1284)).toBe('1.284 arquivos');
      expect(formatOutlierCount(1)).toBe('1 outlier');
      expect(formatOutlierCount(12)).toBe('12 outliers');
      expect(formatExcludedFiles(0)).toBe('Nenhum arquivo excluído');
      expect(formatExcludedFiles(1)).toBe('1 arquivo excluído');
      expect(formatExcludedFiles(9)).toBe('9 arquivos excluídos');
    });

    it('diz onde o valor fica em relação à faixa de referência', () => {
      const reference = getMetricReference('comment_lines_density', commentsReference);

      expect(describeReferencePosition(87, reference, 'percent')).toBe('Acima do máximo de referência (30%)');
      expect(describeReferencePosition(2, reference, 'percent')).toBe('Abaixo do mínimo de referência (10%)');
      expect(describeReferencePosition(20, reference, 'percent')).toBe('Dentro da faixa de referência');
      expect(describeReferencePosition(20, null, 'percent')).toBeNull();
    });

    it('monta as linhas do resumo na ordem do protótipo', () => {
      const rows = getSummaryRows(
        { count: 212, min: 1, q1: 3, median: 7, q3: 14, max: 87, mean: 10.43, std_dev: 11.82 },
        'count',
        8
      );

      expect(rows).toEqual([
        { label: 'Arquivos analisados', value: '212' },
        { label: 'Mínimo', value: '1' },
        { label: '1º quartil', value: '3' },
        { label: 'Mediana', value: '7' },
        { label: '3º quartil', value: '14' },
        { label: 'Máximo', value: '87' },
        { label: 'Média', value: '10,4' },
        { label: 'Desvio padrão', value: '11,8' },
        { label: 'Outliers', value: '8' }
      ]);
    });
  });

  describe('mensagens de falta de dados (CA8)', () => {
    const terms = { repository: 'repositório', repositories: 'repositórios' };
    const repository: MetricDistributionRepository = {
      repository_id: 11,
      repository_name: 'action',
      collected_at: '2026-10-14T21:03:11-03:00',
      excluded_files: 0,
      summary: null
    };

    it('sem coleta por arquivo na release, orienta a rodar a análise do SonarCloud', () => {
      expect(getMissingDataMessage({ ...repository, collected_at: null }, 'complexity', terms)).toEqual({
        title: 'Não há métricas por arquivo do repositório action nesta release',
        description:
          'A última coleta deste repositório não trouxe métricas do SonarQube por arquivo. Confira se a análise do ' +
          'SonarCloud roda na pipeline antes da coleta do MeasureSoftGram.'
      });
    });

    it('com todos os arquivos sem linhas de código, explica a exclusão', () => {
      expect(getMissingDataMessage({ ...repository, excluded_files: 9 }, 'coverage', terms)).toEqual({
        title: 'Todos os arquivos do repositório action ficaram fora',
        description:
          'Os 9 arquivos com coverage na última coleta não têm linhas de código (ncloc = 0) e ficam fora, como no ' +
          'cálculo das medidas.'
      });
      expect(getMissingDataMessage({ ...repository, excluded_files: 1 }, 'coverage', terms).description).toBe(
        'O único arquivo com coverage na última coleta não tem linhas de código (ncloc = 0) e fica fora, como no ' +
          'cálculo das medidas.'
      );
    });

    it('com coleta sem a métrica, aponta a métrica que faltou', () => {
      expect(getMissingDataMessage(repository, 'coverage', terms)).toEqual({
        title: 'A última coleta do repositório action não trouxe coverage por arquivo',
        description: 'Confira se o SonarCloud calcula coverage na análise (a cobertura depende do relatório de testes).'
      });
      expect(getMissingDataMessage(repository, 'complexity', terms).description).toBe(
        'Confira se o SonarCloud calcula complexity na análise.'
      );
    });

    it('na comparação, distingue repositórios sem coleta de coleta sem a métrica', () => {
      expect(getComparisonMissingDataMessage([{ ...repository, collected_at: null }], 'complexity', terms).title).toBe(
        'Nenhum repositório tem métricas por arquivo nesta release'
      );
      expect(getComparisonMissingDataMessage([repository], 'coverage', terms)).toEqual({
        title: 'Nenhum repositório tem coverage por arquivo nesta release',
        description:
          'A última coleta dos repositórios não trouxe coverage por arquivo. Confira se o SonarCloud calcula coverage ' +
          'na análise (a cobertura depende do relatório de testes).'
      });
    });

    it('na comparação, explica quando os arquivos ficaram fora por ncloc = 0', () => {
      const excluded = { ...repository, excluded_files: 7 };
      expect(
        getComparisonMissingDataMessage([excluded, { ...repository, collected_at: null }], 'sqale_debt_ratio', terms)
      ).toEqual({
        title: 'Todos os arquivos com sqale_debt_ratio ficaram fora nesta release',
        description:
          'Nos repositórios com coleta, os arquivos com sqale_debt_ratio não têm linhas de código (ncloc = 0) e ' +
          'ficam fora, como no cálculo das medidas.'
      });
      expect(getComparisonMissingDataMessage([excluded, repository], 'complexity', terms)).toEqual({
        title: 'Nenhum repositório tem complexity por arquivo nesta release',
        description:
          'A última coleta dos repositórios não trouxe complexity por arquivo ou só trouxe arquivos sem linhas de ' +
          'código (ncloc = 0), que ficam fora. Confira se o SonarCloud calcula complexity na análise.'
      });
    });
  });
});

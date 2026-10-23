import { measureMatrix, repository } from '@pages/products/[product]/dashboards/entidade/tests/fixtures';
import {
  cellId,
  formatContribution,
  formatDelta,
  formatScore,
  getColumnGroups,
  getContributions,
  getHighlightedCells,
  getPairs,
  getReading,
  getWorstPairs,
  hasAnyValue,
  sortRepositoriesByTsqmi
} from '../entityMatrix';

describe('entityMatrix', () => {
  describe('formatação', () => {
    it('escreve os valores de 0 a 1 com vírgula e duas casas', () => {
      expect(formatScore(0.7)).toBe('0,70');
      expect(formatScore(0.184)).toBe('0,18');
    });

    it('escreve a variação com sinal e "—" sem os dois valores', () => {
      expect(formatDelta(0.18, 0.47)).toBe('−0,29');
      expect(formatDelta(0.71, 0.7)).toBe('+0,01');
      expect(formatDelta(0.7, 0.7)).toBe('0,00');
      expect(formatDelta(0.7, null)).toBe('—');
      expect(formatDelta(null, 0.7)).toBe('—');
    });

    it('escreve a contribuição com três casas e sinal', () => {
      expect(formatContribution(-0.0213)).toBe('−0,021');
      expect(formatContribution(0.004)).toBe('+0,004');
      expect(formatContribution(-0.0001)).toBe('0,000');
    });
  });

  it('ordena as linhas do pior para o melhor TSQMI, com os sem TSQMI no fim', () => {
    const rows = sortRepositoriesByTsqmi([
      ...measureMatrix().repositories,
      repository(4, 'CLI', [null, null], {}),
      repository(5, 'Action', [0.41, null], {})
    ]);

    expect(rows.map((row) => row.name)).toEqual(['Action', 'AI', 'Front', 'Service', 'CLI']);
  });

  describe('getColumnGroups', () => {
    it('agrupa as colunas vizinhas pelas entidades de cima, uma linha por nível', () => {
      const [characteristics, subcharacteristics] = getColumnGroups(measureMatrix().columns);

      expect(characteristics.map(({ key, span, weight }) => [key, span, weight])).toEqual([
        ['reliability', 3, 34],
        ['maintainability', 1, 33]
      ]);
      expect(subcharacteristics.map(({ key, start, span }) => [key, start, span])).toEqual([
        ['testing_status', 0, 2],
        ['maturity', 2, 1],
        ['modifiability', 3, 1]
      ]);
    });

    it('não tem grupos no nível característica', () => {
      expect(getColumnGroups([{ key: 'reliability', name: 'Reliability', weight: 34, path: [] }])).toEqual([]);
    });

    it('não junta o mesmo pai quando as colunas não são vizinhas', () => {
      const { columns } = measureMatrix();

      const [groups] = getColumnGroups([columns[0], columns[3], columns[1]]);

      expect(groups.map(({ key, span }) => [key, span])).toEqual([
        ['reliability', 1],
        ['maintainability', 1],
        ['reliability', 1]
      ]);
    });
  });

  it('destaca as 3 células de contribuição mais negativa', () => {
    expect(getHighlightedCells(getPairs(measureMatrix()))).toEqual(
      new Set([cellId(3, 'test_coverage'), cellId(2, 'test_coverage'), cellId(2, 'commented_file_density')])
    );
  });

  it('não destaca células que melhoraram o indicador', () => {
    const pairs = getPairs(
      measureMatrix({ repositories: [repository(1, 'api', [0.7, 0.6], { passed_tests: [0.9, 0.8, 0.01] })] })
    );

    expect(getHighlightedCells(pairs).size).toBe(0);
  });

  it('lista as contribuições da maior piora para a maior melhora, sem as que não mudaram o indicador', () => {
    const contributions = getContributions(getPairs(measureMatrix()));

    expect(contributions.map((pair) => [pair.repository.name, pair.column.key, pair.contribution])).toEqual([
      ['Front', 'test_coverage', -0.021],
      ['AI', 'test_coverage', -0.017],
      ['AI', 'commented_file_density', -0.012],
      ['AI', 'ci_feedback_time', -0.008],
      ['Service', 'test_coverage', -0.004],
      ['Service', 'ci_feedback_time', -0.002],
      ['Front', 'commented_file_density', -0.002],
      ['Front', 'passed_tests', 0.001],
      ['Service', 'commented_file_density', 0.003],
      ['AI', 'passed_tests', 0.005]
    ]);
  });

  it('limita as contribuições às que mais mudaram o indicador', () => {
    const contributions = getContributions(getPairs(measureMatrix()), 3);

    expect(contributions.map((pair) => pair.contribution)).toEqual([-0.021, -0.017, -0.012]);
  });

  it('ranqueia os pares com valor do menor para o maior', () => {
    const worst = getWorstPairs(getPairs(measureMatrix()), 4);

    expect(worst.map((pair) => `${pair.repository.name} · ${pair.column.key}`)).toEqual([
      'AI · test_coverage',
      'Front · commented_file_density',
      'AI · commented_file_density',
      'Front · test_coverage'
    ]);
  });

  describe('getReading', () => {
    it('aponta a entidade de menor média e a de maior distância entre o menor e o maior valor', () => {
      const reading = getReading(measureMatrix());

      expect(reading?.weakest.column.key).toBe('commented_file_density');
      expect(reading?.weakest.mean).toBeCloseTo(0.34);
      expect(reading?.widest).toEqual(
        expect.objectContaining({
          lowest: { repository: 'AI', value: 0.18 },
          highest: { repository: 'Service', value: 0.81 }
        })
      );
      expect(reading?.widest?.column.key).toBe('test_coverage');
    });

    it('não tem dispersão com um repositório só, nem leitura sem valores', () => {
      const single = measureMatrix({ repositories: [measureMatrix().repositories[0]] });
      expect(getReading(single)?.widest).toBeNull();

      const empty = measureMatrix({ repositories: [repository(1, 'api', [null, null], {})] });
      expect(getReading(empty)).toBeNull();
      expect(hasAnyValue(empty)).toBe(false);
      expect(hasAnyValue(single)).toBe(true);
    });
  });
});

import { QualityModelNode, QualityModelNodeType } from '@customTypes/metamodel';
import {
  buildEntitySelectors,
  DISTRIBUTION_LEVEL_LABELS,
  getSelectedEntity,
  getSelectorLevels,
  selectEntity
} from '../distributionCascade';

function node(type: QualityModelNodeType, key: string, children: QualityModelNode[] = []): QualityModelNode {
  return { id: null, type, key, name: key.toUpperCase(), description: null, weight: null, children };
}

// as métricas do GitHub (TRK) ficam em duas medidas; a manutenibilidade só tem métricas por arquivo
const tree = node('tsqmi', 'tsqmi', [
  node('characteristic', 'reliability', [
    node('subcharacteristic', 'testing_status', [
      node('measure', 'passed_tests', [node('metric', 'tests'), node('metric', 'test_failures')]),
      node('measure', 'ci_feedback_time', [node('metric', 'sum_ci_feedback_times'), node('metric', 'total_builds')])
    ])
  ]),
  node('characteristic', 'maintainability', [
    node('subcharacteristic', 'modifiability', [
      node('measure', 'non_complex_file_density', [node('metric', 'complexity'), node('metric', 'functions')])
    ])
  ]),
  node('characteristic', 'functional_suitability', [
    node('subcharacteristic', 'functional_completeness', [
      node('measure', 'team_throughput', [node('metric', 'resolved_issues'), node('metric', 'total_issues')])
    ])
  ])
]);

const tracked = new Set(['sum_ci_feedback_times', 'total_builds', 'resolved_issues', 'total_issues']);

function keys(selectors: ReturnType<typeof buildEntitySelectors>) {
  return selectors.map((selector) => [selector.level, selector.options.map((option) => option.key), selector.value]);
}

describe('getSelectorLevels', () => {
  it('tem um seletor por nível do topo até o escolhido, e nenhum no TSQMI', () => {
    expect(getSelectorLevels('tsqmi')).toEqual([]);
    expect(getSelectorLevels('characteristic')).toEqual(['characteristic']);
    expect(getSelectorLevels('metric')).toEqual(['characteristic', 'subcharacteristic', 'measure', 'metric']);
  });

  it('nomeia os cinco níveis', () => {
    expect(Object.values(DISTRIBUTION_LEVEL_LABELS)).toEqual([
      'TSQMI',
      'Característica',
      'Subcaracterística',
      'Medida',
      'Métrica'
    ]);
  });
});

describe('buildEntitySelectors', () => {
  it('no TSQMI não tem seletor', () => {
    expect(buildEntitySelectors(tree, 'tsqmi', {}, tracked)).toEqual([]);
  });

  it('abre na primeira entidade de cada nível, filtrada pela de cima', () => {
    expect(keys(buildEntitySelectors(tree, 'measure', {}, tracked))).toEqual([
      ['characteristic', ['reliability', 'maintainability', 'functional_suitability'], 'reliability'],
      ['subcharacteristic', ['testing_status'], 'testing_status'],
      ['measure', ['passed_tests', 'ci_feedback_time'], 'passed_tests']
    ]);
  });

  it('segue a entidade escolhida em cada nível', () => {
    const selectors = buildEntitySelectors(tree, 'measure', { characteristic: 'maintainability' }, tracked);

    expect(keys(selectors)).toEqual([
      ['characteristic', ['reliability', 'maintainability', 'functional_suitability'], 'maintainability'],
      ['subcharacteristic', ['modifiability'], 'modifiability'],
      ['measure', ['non_complex_file_density'], 'non_complex_file_density']
    ]);
  });

  it('no nível métrica, só deixa os ramos que chegam a uma métrica com valor por análise', () => {
    expect(keys(buildEntitySelectors(tree, 'metric', {}, tracked))).toEqual([
      ['characteristic', ['reliability', 'functional_suitability'], 'reliability'],
      ['subcharacteristic', ['testing_status'], 'testing_status'],
      ['measure', ['ci_feedback_time'], 'ci_feedback_time'],
      ['metric', ['sum_ci_feedback_times', 'total_builds'], 'sum_ci_feedback_times']
    ]);
  });

  it('volta à primeira opção quando a escolha não está na configuração da release', () => {
    const selectors = buildEntitySelectors(tree, 'metric', { characteristic: 'maintainability' }, tracked);

    expect(selectors[0].value).toBe('reliability');
  });

  it('sem métricas com valor por análise, o nível métrica fica sem opções', () => {
    const selectors = buildEntitySelectors(tree, 'metric', {}, new Set());

    expect(selectors.map((selector) => selector.options)).toEqual([[], [], [], []]);
    expect(getSelectedEntity(selectors)).toBeUndefined();
  });

  it('sem a árvore, os seletores ficam vazios', () => {
    expect(keys(buildEntitySelectors(undefined, 'subcharacteristic', {}))).toEqual([
      ['characteristic', [], undefined],
      ['subcharacteristic', [], undefined]
    ]);
  });
});

describe('selectEntity', () => {
  it('trocar um nível de cima limpa os de baixo', () => {
    const before = buildEntitySelectors(tree, 'metric', { metric: 'total_builds' }, tracked);
    const selection = selectEntity(before, 'characteristic', 'functional_suitability');

    expect(selection).toEqual({ characteristic: 'functional_suitability' });
    expect(keys(buildEntitySelectors(tree, 'metric', selection, tracked)).slice(2)).toEqual([
      ['measure', ['team_throughput'], 'team_throughput'],
      ['metric', ['resolved_issues', 'total_issues'], 'resolved_issues']
    ]);
  });

  it('fixa as entidades em vigor nos níveis de cima', () => {
    const before = buildEntitySelectors(tree, 'metric', {}, tracked);

    expect(selectEntity(before, 'metric', 'total_builds')).toEqual({
      characteristic: 'reliability',
      subcharacteristic: 'testing_status',
      measure: 'ci_feedback_time',
      metric: 'total_builds'
    });
  });
});

describe('getSelectedEntity', () => {
  it('é a entidade do último seletor', () => {
    const selectors = buildEntitySelectors(tree, 'subcharacteristic', {}, tracked);

    expect(getSelectedEntity(selectors)).toEqual({ key: 'testing_status', name: 'TESTING_STATUS' });
  });

  it('no TSQMI não há', () => {
    expect(getSelectedEntity([])).toBeUndefined();
  });
});

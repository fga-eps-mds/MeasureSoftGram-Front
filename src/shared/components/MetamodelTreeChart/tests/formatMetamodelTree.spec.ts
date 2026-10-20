import { QualityModelNode } from '@customTypes/metamodel';
import {
  countMetricOccurrences,
  enrichTreeNodes,
  formatThresholdSummary,
  buildEChartsTreeOption,
  METAMODEL_COLORS,
  formatWeightLabel,
} from '../formatMetamodelTree';

describe('formatMetamodelTree utilities', () => {
  const sampleTree: QualityModelNode = {
    id: null,
    type: 'tsqmi',
    key: 'tsqmi',
    name: 'TSQMI',
    description: 'Índice de Qualidade',
    weight: 100,
    children: [
      {
        id: 1,
        type: 'characteristic',
        key: 'maintainability',
        name: 'Maintainability',
        description: 'Capacidade de manutenção',
        weight: 50,
        children: [
          {
            id: 11,
            type: 'subcharacteristic',
            key: 'modifiability',
            name: 'Modifiability',
            description: 'Facilidade de modificação',
            weight: 60,
            children: [
              {
                id: 111,
                type: 'measure',
                key: 'density_non_complex',
                name: 'Densidade de arquivos não complexos',
                description: 'Arquivos de baixa complexidade',
                weight: 34,
                min_threshold: 0,
                max_threshold: 10,
                children: [
                  {
                    id: 1001,
                    type: 'metric',
                    key: 'ncloc',
                    name: 'ncloc',
                    description: 'Linhas de código',
                    weight: null,
                    children: [],
                  },
                  {
                    id: 1002,
                    type: 'metric',
                    key: 'complexity',
                    name: 'complexity',
                    description: 'Complexidade ciclomática',
                    weight: null,
                    children: [],
                  },
                ],
              },
              {
                id: 112,
                type: 'measure',
                key: 'density_commented',
                name: 'Densidade de arquivos comentados',
                description: 'Linhas comentadas',
                weight: 33,
                min_threshold: 10,
                max_threshold: 30,
                children: [
                  {
                    id: 1001,
                    type: 'metric',
                    key: 'ncloc',
                    name: 'ncloc',
                    description: 'Linhas de código',
                    weight: null,
                    children: [],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  it('countMetricOccurrences deve contar ocorrências de métricas e identificar compartilhadas', () => {
    const counts = countMetricOccurrences(sampleTree);
    expect(counts['ncloc']).toBe(2);
    expect(counts['complexity']).toBe(1);
  });

  it('enrichTreeNodes deve marcar isSharedMetric=true para métricas presentes em múltiplas medidas (CA6)', () => {
    const counts = countMetricOccurrences(sampleTree);
    const enriched = enrichTreeNodes(sampleTree, counts);

    const char = enriched.children[0];
    const subchar = char.children[0];
    const measure1 = subchar.children[0];
    const nclocMetric1 = measure1.children[0];
    const complexityMetric = measure1.children[1];

    expect(nclocMetric1.isSharedMetric).toBe(true);
    expect(complexityMetric.isSharedMetric).toBe(false);
  });

  it('enrichTreeNodes deve recolher a partir das subcaracterísticas por padrão (depth >= 2) (CA4)', () => {
    const counts = countMetricOccurrences(sampleTree);
    const enriched = enrichTreeNodes(sampleTree, counts, '', 0, 2);

    expect(enriched.collapsed).toBe(false); // TSQMI depth 0
    expect(enriched.children[0].collapsed).toBe(false); // Characteristic depth 1
    expect(enriched.children[0].children[0].collapsed).toBe(true); // Subcharacteristic depth 2 recolhido
  });

  it('enrichTreeNodes deve expandir todos os nós quando forceCollapseDepth = -1', () => {
    const counts = countMetricOccurrences(sampleTree);
    const enriched = enrichTreeNodes(sampleTree, counts, '', 0, -1);

    expect(enriched.children[0].children[0].collapsed).toBe(false);
  });

  it('formatThresholdSummary deve formatar limites de referência corretamente', () => {
    expect(formatThresholdSummary(0, 10)).toBe('mín. 0 · máx. 10');
    expect(formatThresholdSummary(5, null)).toBe('mín. 5');
    expect(formatThresholdSummary(null, 20)).toBe('máx. 20');
    expect(formatThresholdSummary(null, null)).toBe('');
  });

  it('buildEChartsTreeOption deve retornar opções configuradas com series-tree', () => {
    const counts = countMetricOccurrences(sampleTree);
    const enriched = enrichTreeNodes(sampleTree, counts);
    const options: any = buildEChartsTreeOption(enriched);

    expect(options.series).toHaveLength(1);
    expect(options.series[0].type).toBe('tree');
    expect(options.series[0].orient).toBe('LR');
    // a descrição fica no card do clique, sem tooltip ao passar o mouse
    expect(options.tooltip).toEqual({ show: false });

    // Testa formatação de labels
    const formatter = options.series[0].label.formatter;
    const tsqmiLabel = formatter({ data: enriched });
    expect(tsqmiLabel).toContain('tsqmiCard');
    expect(tsqmiLabel).not.toContain('%');

    const charLabel = formatter({ data: enriched.children[0] });
    expect(charLabel).toContain('Maintainability');
    expect(charLabel).toContain('· 50%');

    const subcharLabel = formatter({ data: enriched.children[0].children[0], isExpand: false });
    expect(subcharLabel).toContain('Modifiability');
    expect(subcharLabel).toContain('+ 2 medidas');

    const subcharExpandedLabel = formatter({ data: enriched.children[0].children[0], isExpand: true });
    expect(subcharExpandedLabel).toContain('−');

    const measureLabel = formatter({ data: enriched.children[0].children[0].children[0] });
    expect(measureLabel).toContain('Densidade de arquivos não complexos');
    expect(measureLabel).toContain('mín. 0 · máx. 10');

    const metricLabel = formatter({ data: enriched.children[0].children[0].children[0].children[0] });
    expect(metricLabel).toContain('ncloc');
    expect(metricLabel).toContain('também em outra medida');
  });

  it('não mostra 0% quando o nó não tem peso na configuração', () => {
    const enriched = enrichTreeNodes(sampleTree, countMetricOccurrences(sampleTree));
    const { formatter } = (buildEChartsTreeOption(enriched) as any).series[0].label;
    const measure = { ...enriched.children[0].children[0].children[0], weight: null };

    expect(formatter({ data: measure })).not.toContain('%');
    expect(formatWeightLabel(null, 'weight')).toBe('');
    expect(formatWeightLabel(25, 'weight')).toBe('  {weight|· 25%}');
  });

  it('buildEChartsTreeOption deve retornar objeto vazio para nó raiz nulo', () => {
    expect(buildEChartsTreeOption(null)).toEqual({});
  });
});

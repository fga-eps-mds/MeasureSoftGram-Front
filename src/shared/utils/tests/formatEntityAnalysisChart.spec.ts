import { EntityAnalysis, EntityAnalysisRepository } from '@customTypes/product';
import {
  formatEntityAnalysisChartOptions,
  formatEntityValue,
  formatReferenceCaption,
  hasAnyValue,
  NO_DATA_LABEL,
  sortRepositoriesWorstToBest,
} from '../formatEntityAnalysisChart';

const repository = (id: number, name: string, value: number | null): EntityAnalysisRepository => ({
  id,
  name,
  value,
  created_at: value === null ? null : '2026-03-10T10:00:00-03:00',
  children: [],
});

const analysis = (overrides: Partial<EntityAnalysis> = {}): EntityAnalysis => ({
  release: { id: 1, release_name: 'v1.0', start_at: '2026-03-01', end_at: '2026-03-31' },
  level: 'characteristic',
  entity: { key: 'maintainability', name: 'Maintainability' },
  reference: { goal: 0.6 },
  repositories: [repository(1, 'api', 0.8), repository(2, 'parser', 0.3), repository(3, 'web', null)],
  ...overrides,
});

describe('formatEntityAnalysisChart', () => {
  describe('sortRepositoriesWorstToBest', () => {
    it('ordena do menor para o maior valor e deixa os sem dado no fim', () => {
      const sorted = sortRepositoriesWorstToBest([
        repository(1, 'web', null),
        repository(2, 'api', 0.8),
        repository(3, 'cli', null),
        repository(4, 'parser', 0.3),
      ]);

      expect(sorted.map((item) => item.name)).toEqual(['parser', 'api', 'cli', 'web']);
    });

    it('desempata pelo nome', () => {
      const sorted = sortRepositoriesWorstToBest([repository(1, 'b', 0.5), repository(2, 'a', 0.5)]);

      expect(sorted.map((item) => item.name)).toEqual(['a', 'b']);
    });
  });

  describe('formatEntityValue', () => {
    it('mostra "sem dado" em vez de zero quando não há valor', () => {
      expect(formatEntityValue(null, 'characteristic')).toBe(NO_DATA_LABEL);
      expect(formatEntityValue(null, 'metric', 'PERCENT')).toBe(NO_DATA_LABEL);
    });

    it('usa duas casas para valores de 0 a 1', () => {
      expect(formatEntityValue(0.456, 'measure')).toBe('0.46');
      expect(formatEntityValue(0, 'subcharacteristic')).toBe('0.00');
    });

    it('mostra o valor bruto da métrica com a unidade', () => {
      expect(formatEntityValue(72.5, 'metric', 'PERCENT')).toBe('72.50 %');
      expect(formatEntityValue(120, 'metric', 'MILLISEC')).toBe('120 ms');
      expect(formatEntityValue(12, 'metric', 'INT')).toBe('12');
    });
  });

  describe('hasAnyValue', () => {
    it('é falso quando nenhum repositório tem valor na release', () => {
      expect(hasAnyValue(analysis({ repositories: [repository(1, 'api', null)] }))).toBe(false);
      expect(hasAnyValue(undefined)).toBe(false);
    });

    it('é verdadeiro quando algum repositório tem valor', () => {
      expect(hasAnyValue(analysis())).toBe(true);
    });
  });

  describe('formatReferenceCaption', () => {
    it('descreve a meta da release para características', () => {
      expect(formatReferenceCaption(analysis())).toBe('Meta planejada da release: 0.60');
    });

    it('descreve a faixa de referência para medidas', () => {
      const caption = formatReferenceCaption(
        analysis({ level: 'measure', reference: { min_threshold: 60, max_threshold: 100 } })
      );

      expect(caption).toBe('Faixa de referência da medida (mínimo – máximo): 60 – 100');
    });

    it('não tem legenda sem referência', () => {
      expect(formatReferenceCaption(analysis({ level: 'metric', reference: null }))).toBeNull();
    });
  });

  describe('formatEntityAnalysisChartOptions', () => {
    it('coloca o pior repositório no topo e os sem dado embaixo', () => {
      const options = formatEntityAnalysisChartOptions(analysis(), true);

      // o eixo de categorias desenha de baixo para cima
      expect(options.yAxis.data).toEqual(['web', 'api', 'parser']);
    });

    it('escreve o valor na barra e "sem dado" no repositório sem valor', () => {
      const [series] = formatEntityAnalysisChartOptions(analysis(), true).series;
      const [web, api] = series.data;

      expect(web.label.formatter).toBe(NO_DATA_LABEL);
      expect(web.itemStyle.color).toBe('transparent');
      expect(api.label.formatter).toBe('0.80');
      expect(api.repositoryId).toBe(1);
    });

    it('desenha a linha da meta só quando a referência está ligada', () => {
      const withReference = formatEntityAnalysisChartOptions(analysis(), true).series[0];
      const withoutReference = formatEntityAnalysisChartOptions(analysis(), false).series[0];

      expect(withReference.markLine?.data).toEqual([{ xAxis: 0.6 }]);
      expect(withoutReference.markLine).toBeUndefined();
    });

    it('limita o eixo a 1 para valores normalizados e deixa livre para métricas', () => {
      const normalized = formatEntityAnalysisChartOptions(analysis(), true);
      const metric = formatEntityAnalysisChartOptions(
        analysis({
          level: 'metric',
          entity: { key: 'coverage', name: 'Coverage', metric_type: 'PERCENT' },
          reference: null,
          repositories: [repository(1, 'api', 81)],
        }),
        true
      );

      expect(normalized.xAxis.max).toBe(1);
      expect(metric.xAxis.max).toBeUndefined();
      expect(metric.series[0].data[0].label.formatter).toBe('81 %');
    });

    it('mostra o repositório e o valor no tooltip', () => {
      const options = formatEntityAnalysisChartOptions(analysis(), true);

      expect(options.tooltip.formatter({ name: 'web', dataIndex: 0 })).toBe(
        `web<br/>Maintainability: <b>${NO_DATA_LABEL}</b>`
      );
    });
  });
});

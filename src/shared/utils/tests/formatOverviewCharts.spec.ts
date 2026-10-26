import {
  AccomplishedRepository,
  ReleaseDashboardCharacteristics,
  ReleaseDashboardRepository
} from '@customTypes/product';
import { comparePlannedAccomplished } from '@utils/comparePlannedAccomplished';
import {
  formatDecimal,
  formatQualityGrade,
  formatRadarOptions,
  formatTotal,
  formatTsqmiBarOptions,
  formatTsqmiTooltip,
  formatVariation,
  getDefaultAnalysisRepository,
  getTsqmiBars,
  hasAccomplishedValues
} from '../formatOverviewCharts';

function repository(id: number, name: string, tsqmi: number | null): ReleaseDashboardRepository {
  return { id, name, tsqmi: { value: tsqmi, created_at: tsqmi === null ? null : '2026-02-10T10:00:00-03:00' } };
}

function tsqmiData(repositories: ReleaseDashboardRepository[]): ReleaseDashboardCharacteristics {
  return { release: { id: 2, release_name: 'R2', start_at: '', end_at: '' }, repositories };
}

function accomplished(name: string, values: Record<string, number | null>, normDiff = 0.1): AccomplishedRepository {
  return {
    repository_name: name,
    norm_diff: normDiff,
    characteristics: Object.entries(values).map(([key, value]) => ({ name: key, value: value as number, diff: 0 }))
  };
}

describe('formatOverviewCharts', () => {
  it('formata números no padrão brasileiro', () => {
    expect(formatDecimal(0.8123)).toBe('0,81');
    expect(formatDecimal(null)).toBe('sem dado');
    expect(formatTotal(1284)).toBe('1.284');
    expect(formatVariation(-0.03)).toBe('−0,03');
    expect(formatVariation(0.04)).toBe('+0,04');
    expect(formatVariation(0.001)).toBe('0,00');
  });

  it('escreve o grau e o rótulo da faixa do indicador', () => {
    expect(formatQualityGrade(0.72)).toBe('B · Muito bom');
    expect(formatQualityGrade(0.8)).toBe('A · Ótimo');
    expect(formatQualityGrade(0.19)).toBe('E · Muito ruim');
  });

  describe('Indicador Total da Qualidade por repositório', () => {
    const current = tsqmiData([
      repository(1, 'core', 0.77),
      repository(2, 'front', 0.72),
      repository(3, 'service', 0.81),
      repository(4, 'docs', null),
      repository(5, 'action', 0.17)
    ]);
    const previous = tsqmiData([repository(2, 'front', 0.75)]);

    it('ordena do maior indicador para o menor e tira quem não tem valor na release', () => {
      const bars = getTsqmiBars(current, previous);

      expect(bars.map((bar) => bar.name)).toEqual(['service', 'core', 'front', 'action']);
      expect(bars.find((bar) => bar.name === 'front')?.previous).toBe(0.75);
      expect(bars.find((bar) => bar.name === 'core')?.previous).toBeNull();
    });

    it('sem dados, não tem barras', () => {
      expect(getTsqmiBars(undefined)).toEqual([]);
    });

    it('mostra a faixa e a variação em relação à release anterior no tooltip', () => {
      const front = getTsqmiBars(current, previous).find((bar) => bar.name === 'front')!;

      expect(formatTsqmiTooltip(front, 'R2', 'R1')).toBe(
        '<strong>front · R2</strong><br/>Indicador Total da Qualidade: 0,72 (B · Muito bom)<br/>Variação: −0,03 em relação à R1'
      );
    });

    it('sem valor na release anterior, o tooltip não tem variação', () => {
      const core = getTsqmiBars(current, previous).find((bar) => bar.name === 'core')!;

      expect(formatTsqmiTooltip(core, 'R2', 'R1')).not.toContain('Variação');
    });

    it('escapa o nome do repositório no tooltip', () => {
      const bar = { id: 9, name: '<b>repo</b>', value: 0.5, previous: null };

      expect(formatTsqmiTooltip(bar, 'R2')).not.toContain('<b>');
    });

    it('pinta cada barra com a cor da faixa do valor e escreve o grau', () => {
      const bars = getTsqmiBars(current);
      const options = formatTsqmiBarOptions(bars, 'R2');

      expect(options.yAxis.data).toEqual(['service', 'core', 'front', 'action']);
      expect(options.series[0].data).toEqual([
        { value: 0.81, itemStyle: { color: '#04724D' } },
        { value: 0.77, itemStyle: { color: '#0DC889' } },
        { value: 0.72, itemStyle: { color: '#0DC889' } },
        { value: 0.17, itemStyle: { color: '#BE2E0E' } }
      ]);
      expect(options.series[0].label.formatter({ value: 0.81 })).toBe('0,81 · A');
      expect(options.xAxis).toMatchObject({ min: 0, max: 1 });
      expect(options.tooltip.formatter({ dataIndex: 0 })).toContain('service · R2');
    });
  });

  describe('equalizador e radar (analysis_data)', () => {
    const repositories = [
      accomplished('docs', { reliability: null }),
      accomplished('core', { reliability: 0.74, maintainability: 0.78 })
    ];
    const planned = [
      { name: 'reliability', value: 0.7, diff: 0 },
      { name: 'maintainability', value: 0.8, diff: 0 },
      { name: 'functional_suitability', value: 0.6, diff: 0 }
    ];

    it('começa pelo primeiro repositório com alguma característica realizada', () => {
      expect(getDefaultAnalysisRepository(repositories)).toBe('core');
      expect(getDefaultAnalysisRepository([repositories[0]])).toBe('docs');
      expect(getDefaultAnalysisRepository([])).toBeUndefined();
    });

    it('sabe se o repositório tem alguma característica realizada', () => {
      expect(hasAccomplishedValues(repositories[0])).toBe(false);
      expect(hasAccomplishedValues(repositories[1])).toBe(true);
      expect(hasAccomplishedValues(undefined)).toBe(false);
    });

    it('usa os mesmos eixos e valores do realizado (Rd) do equalizador', () => {
      const comparisons = comparePlannedAccomplished(planned, repositories[1].characteristics);
      const options = formatRadarOptions(comparisons, 'core', (key) => `nome de ${key}`);

      expect(options.radar.indicator).toEqual([
        { name: 'nome de reliability', max: 1 },
        { name: 'nome de maintainability', max: 1 },
        { name: 'nome de functional_suitability', max: 1 }
      ]);
      expect(options.series[0].data[0]).toEqual({ name: 'core', value: [0.74, 0.78, '-'] });
      expect(comparisons.map((comparison) => comparison.rd)).toEqual([0.74, 0.78, null]);
    });

    it('deixa sem ponto a característica sem realizado, em vez de zero', () => {
      const options = formatRadarOptions(comparePlannedAccomplished(planned, []), 'web', (key) => key);

      expect(options.series[0].data[0].value).toEqual(['-', '-', '-']);
      expect(options.series[0].label.formatter({ value: '-' })).toBe('');
      expect(options.series[0].label.formatter({ value: 0.6 })).toBe('0,60');
    });
  });
});

import { ReleaseDashboardCharacteristics, ReleaseDashboardRepository } from '@customTypes/product';
import {
  formatDecimal,
  formatPlannedAccomplishedOptions,
  formatRadarOptions,
  formatTotal,
  formatTsqmiBarOptions,
  formatTsqmiTooltip,
  formatVariation,
  getDefaultRadarRepository,
  getTsqmiBars,
  hasCharacteristicValues,
  hasPlannedOrAccomplished
} from '../formatOverviewCharts';

function repository(
  id: number,
  name: string,
  tsqmi: number | null,
  values: Record<string, number | null> = {}
): ReleaseDashboardRepository {
  return {
    id,
    name,
    tsqmi: { value: tsqmi, created_at: tsqmi === null ? null : '2026-02-10T10:00:00-03:00' },
    characteristics: Object.entries(values).map(([key, value]) => ({ key, value, created_at: null }))
  };
}

function characteristicsData(repositories: ReleaseDashboardRepository[]): ReleaseDashboardCharacteristics {
  return {
    release: { id: 2, release_name: 'R2', start_at: '', end_at: '' },
    characteristics: [
      { key: 'reliability', name: 'Reliability', planned: 0.7, accomplished: 0.74, dispersion: 0.05 },
      { key: 'maintainability', name: 'Maintainability', planned: null, accomplished: null, dispersion: null }
    ],
    repositories
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

  describe('TSQMI por repositório', () => {
    const current = characteristicsData([
      repository(1, 'core', 0.77),
      repository(2, 'front', 0.72),
      repository(3, 'service', 0.81),
      repository(4, 'docs', null)
    ]);
    const previous = characteristicsData([repository(2, 'front', 0.75)]);

    it('ordena do maior TSQMI para o menor e tira quem não tem valor na release', () => {
      const bars = getTsqmiBars(current, previous);

      expect(bars.map((bar) => bar.name)).toEqual(['service', 'core', 'front']);
      expect(bars.find((bar) => bar.name === 'front')?.previous).toBe(0.75);
      expect(bars.find((bar) => bar.name === 'core')?.previous).toBeNull();
    });

    it('sem dados, não tem barras', () => {
      expect(getTsqmiBars(undefined)).toEqual([]);
    });

    it('mostra a variação em relação à release anterior no tooltip', () => {
      const front = getTsqmiBars(current, previous).find((bar) => bar.name === 'front')!;

      expect(formatTsqmiTooltip(front, 'R2', 'R1')).toBe(
        '<strong>front · R2</strong><br/>TSQMI: 0,72<br/>Variação: −0,03 em relação à R1'
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

    it('monta as barras na ordem e no eixo de 0 a 1', () => {
      const bars = getTsqmiBars(current);
      const options = formatTsqmiBarOptions(bars, 'R2');

      expect(options.yAxis.data).toEqual(['service', 'core', 'front']);
      expect(options.series[0].data).toEqual([0.81, 0.77, 0.72]);
      expect(options.xAxis).toMatchObject({ min: 0, max: 1 });
      expect(options.tooltip.formatter({ dataIndex: 0 })).toContain('service · R2');
    });
  });

  describe('radar', () => {
    const repositories = [
      repository(1, 'docs', null, { reliability: null }),
      repository(2, 'core', 0.7, { reliability: 0.74, maintainability: 0.78 })
    ];

    it('começa pelo primeiro repositório com alguma característica calculada', () => {
      expect(getDefaultRadarRepository(repositories)).toBe(2);
      expect(getDefaultRadarRepository([repositories[0]])).toBe(1);
      expect(getDefaultRadarRepository([])).toBeUndefined();
    });

    it('sabe se o repositório tem alguma característica calculada', () => {
      expect(hasCharacteristicValues(repositories[0])).toBe(false);
      expect(hasCharacteristicValues(repositories[1])).toBe(true);
      expect(hasCharacteristicValues(undefined)).toBe(false);
    });

    it('usa as características da configuração como eixos, de 0 a 1', () => {
      const { characteristics } = characteristicsData([]);
      const options = formatRadarOptions(characteristics, repositories[1]);

      expect(options.radar.indicator).toEqual([
        { name: 'Reliability', max: 1 },
        { name: 'Maintainability', max: 1 }
      ]);
      expect(options.series[0].data[0].value).toEqual([0.74, 0.78]);
    });

    it('deixa sem ponto a característica sem valor, em vez de zero', () => {
      const { characteristics } = characteristicsData([]);
      const options = formatRadarOptions(characteristics, repository(3, 'web', null, { reliability: 0.6 }));

      expect(options.series[0].data[0].value).toEqual([0.6, '-']);
      expect(options.series[0].label.formatter({ value: '-' })).toBe('');
      expect(options.series[0].label.formatter({ value: 0.6 })).toBe('0,60');
    });
  });

  describe('planejado × realizado', () => {
    const { characteristics } = characteristicsData([]);

    it('monta uma barra de planejado e uma de realizado por característica', () => {
      const options = formatPlannedAccomplishedOptions(characteristics);

      expect(options.xAxis.data).toEqual(['Reliability', 'Maintainability']);
      expect(options.series.map((series) => series.name)).toEqual(['Planejado', 'Realizado']);
      expect(options.series[0].data).toEqual([0.7, '-']);
      expect(options.series[1].data).toEqual([0.74, '-']);
    });

    it('mostra a dispersão entre os repositórios no tooltip', () => {
      const options = formatPlannedAccomplishedOptions(characteristics);

      expect(options.tooltip.formatter([{ dataIndex: 0 }])).toBe(
        '<strong>Reliability</strong><br/>Planejado: 0,70<br/>Realizado: 0,74<br/>Dispersão entre os repositórios: ±0,05'
      );
      expect(options.tooltip.formatter([{ dataIndex: 1 }])).toContain('Planejado: sem dado');
    });

    it('sabe se há planejado ou realizado para mostrar', () => {
      expect(hasPlannedOrAccomplished(characteristics)).toBe(true);
      expect(hasPlannedOrAccomplished([characteristics[1]])).toBe(false);
    });
  });
});

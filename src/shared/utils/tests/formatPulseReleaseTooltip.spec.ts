import { TsqmiReleasePoint } from '@customTypes/product';
import { COLOR_TOKENS, PulseRelease } from '../formatPulseChart';
import { formatPulseReleaseTooltip, formatVariationPercent } from '../formatPulseReleaseTooltip';

const release = (overrides: Partial<TsqmiReleasePoint> = {}, previousName: string | undefined = 'Release 1'): PulseRelease => ({
  id: 20,
  name: 'Release 2',
  version: 'Release 2',
  start_at: '2026-08-16T12:00:00Z',
  end_at: '2026-08-30T12:00:00Z',
  previousName,
  tsqmi: {
    release_id: 20,
    value: 0.85,
    created_at: '2026-08-29T12:00:00Z',
    previous_value: 0.7,
    variation: 0.15,
    variation_percent: 21.428571,
    ...overrides
  }
});

describe('formatPulseReleaseTooltip', () => {
  it('mostra nome, encerramento, indicador com a faixa e variação da release anterior (Cenário 4)', () => {
    const html = formatPulseReleaseTooltip([{ repository: 'CLI', release: release(), value: 0.85 }]);

    expect(html).toContain('Release 2');
    expect(html).toContain('Encerramento: 30/08/2026');
    expect(html).toContain('<strong>CLI</strong>');
    expect(html).toContain('Indicador TSQMI: 0,85 (A · Ótimo)');
    expect(html).toContain(`<span style="color:${COLOR_TOKENS.adequate}">+21,43% (+0,15) em relação à Release 1</span>`);
    expect(html).not.toContain('nota');
  });

  it('mostra a queda em vermelho com o sinal de menos', () => {
    const html = formatPulseReleaseTooltip([
      {
        repository: 'CLI',
        release: release({ value: 0.6, previous_value: 0.75, variation: -0.15, variation_percent: -20 }),
        value: 0.6
      }
    ]);

    expect(html).toContain(`<span style="color:${COLOR_TOKENS.critical}">−20,00% (−0,15) em relação à Release 1</span>`);
  });

  it('indica a ausência de base sem indicador na release anterior (Cenário 5)', () => {
    const html = formatPulseReleaseTooltip([
      {
        repository: 'CLI',
        release: release({ previous_value: null, variation: null, variation_percent: null }, undefined),
        value: 0.85
      }
    ]);

    expect(html).toContain('Variação: sem base anterior para comparar');
    expect(html).not.toMatch(/\d,\d{2}%/);
  });

  it('com a anterior igual a 0, mostra só a variação absoluta', () => {
    const html = formatPulseReleaseTooltip([
      {
        repository: 'CLI',
        release: release({ value: 0.1, previous_value: 0, variation: 0.1, variation_percent: null }),
        value: 0.1
      }
    ]);

    expect(html).toContain('>+0,10 em relação à Release 1</span>');
    expect(html).not.toMatch(/\d,\d{2}%/);
  });

  it('lista os repositórios da mesma release sob um único cabeçalho', () => {
    const html = formatPulseReleaseTooltip([
      { repository: 'CLI', release: release(), value: 0.85 },
      { repository: 'Front', release: release({ value: 0.3 }), value: 0.3 }
    ]);

    expect(html.match(/Encerramento/g)).toHaveLength(1);
    expect(html).toContain('<strong>Front</strong>');
    expect(html).toContain('Indicador TSQMI: 0,30 (D · Ruim)');
  });

  it('separa releases diferentes em blocos', () => {
    const other = { ...release(), id: 30, name: 'Release 3', end_at: '2026-09-15T12:00:00Z' };
    const html = formatPulseReleaseTooltip([
      { repository: 'CLI', release: release(), value: 0.85 },
      { repository: 'Front', release: other, value: 0.5 }
    ]);

    expect(html.match(/Encerramento/g)).toHaveLength(2);
    expect(html).toContain('Encerramento: 15/09/2026');
  });

  it('escapa o HTML dos nomes cadastrados', () => {
    const html = formatPulseReleaseTooltip([
      { repository: '<b>repo</b>', release: { ...release(), name: '<img src=x>' }, value: 0.85 }
    ]);

    expect(html).not.toContain('<img');
    expect(html).not.toContain('<b>repo</b>');
  });
});

describe('formatVariationPercent', () => {
  it.each([
    [21.428571, '+21,43%'],
    [-3.1, '−3,10%'],
    [0, '0,00%'],
    [0.001, '0,00%']
  ])('formata %p como %s', (percent, expected) => {
    expect(formatVariationPercent(percent)).toBe(expected);
  });
});

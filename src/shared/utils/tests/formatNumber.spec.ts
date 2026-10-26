import { escapeHtml, formatDecimal, formatVariation } from '../formatNumber';
import * as overview from '../formatOverviewCharts';

describe('formatNumber', () => {
  it.each([
    [0.8123, '0,81'],
    [1, '1,00'],
    [null, 'sem dado'],
    [undefined, 'sem dado'],
  ])('formatDecimal(%p) = %s', (value, expected) => {
    expect(formatDecimal(value)).toBe(expected);
  });

  it.each([
    [0.04, '+0,04'],
    [-0.031, '−0,03'],
    [0.001, '0,00'],
  ])('formatVariation(%p) = %s', (diff, expected) => {
    expect(formatVariation(diff)).toBe(expected);
  });

  it('escapa os caracteres especiais de HTML', () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe('&#60;a href=&#34;x&#34;&#62;&#39;&#38;&#39;&#60;/a&#62;');
  });

  it('continua exportado por formatOverviewCharts', () => {
    expect(overview.formatDecimal).toBe(formatDecimal);
    expect(overview.formatVariation).toBe(formatVariation);
    expect(overview.escapeHtml).toBe(escapeHtml);
  });
});

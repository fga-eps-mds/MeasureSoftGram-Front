import { formatPeriod, formatTimeEvolutionOptions } from '../formatTimeEvolutionChart';

const march1 = new Date(2026, 2, 1).getTime();
const series = [{ key: 'reliability', name: 'Reliability', points: [[march1, 0.456]] as [number, number][] }];

describe('formatPeriod', () => {
  it('mostra o dia ou o mês', () => {
    expect(formatPeriod(march1, 'day')).toBe('01/03/2026');
    expect(formatPeriod(march1, 'month')).toBe('mar/2026');
  });
});

describe('formatTimeEvolutionOptions', () => {
  it('desenha uma linha por entidade no eixo de tempo', () => {
    const options = formatTimeEvolutionOptions(series, 'day', true);

    expect(options.xAxis.type).toBe('time');
    expect(options.series).toHaveLength(1);
    expect(options.series[0]).toMatchObject({ name: 'Reliability', type: 'line', data: [[march1, 0.456]] });
    expect(options.xAxis.axisLabel.formatter(march1)).toBe('01/03/2026');
  });

  it('troca os rótulos e o intervalo mínimo do eixo para meses', () => {
    const daily = formatTimeEvolutionOptions(series, 'day', true);
    const monthly = formatTimeEvolutionOptions(series, 'month', true);

    expect(monthly.xAxis.axisLabel.formatter(march1)).toBe('mar/2026');
    expect(monthly.xAxis.minInterval).toBeGreaterThan(daily.xAxis.minInterval);
  });

  it('vai de 0 a 1 nos valores normalizados e deixa as métricas livres', () => {
    expect(formatTimeEvolutionOptions(series, 'day', true).yAxis.max).toBe(1);
    expect(formatTimeEvolutionOptions(series, 'day', false).yAxis.max).toBeUndefined();
  });

  it('mostra a data e os valores no tooltip', () => {
    const { tooltip } = formatTimeEvolutionOptions(series, 'month', true);
    const html = tooltip.formatter([{ marker: '●', seriesName: 'Reliability', value: [march1, 0.456] }]);

    expect(html).toContain('mar/2026');
    expect(html).toContain('Reliability: <strong>0,46</strong>');
    expect(tooltip.formatter([])).toBe('');
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DistributionScatter from '../DistributionScatter';
import { entity } from './fixtures';

type ChartOption = {
  xAxis: unknown;
  yAxis: unknown;
  legend: { data: { name: string }[] };
  series: { data: number[][] }[];
};

// o ECharts não roda no jsdom: o mock mostra os eixos, a legenda e os pontos que o gráfico receberia
jest.mock('next/dynamic', () => () => ({ option }: { option: ChartOption }) => (
  <div data-testid="echarts">
    {JSON.stringify({
      xAxis: option.xAxis,
      yAxis: option.yAxis,
      legend: option.legend.data.map((item) => item.name),
      points: option.series[0].data,
      outliers: option.series[1].data
    })}
  </div>
));

function chart() {
  return JSON.parse(screen.getByTestId('echarts').textContent ?? '{}');
}

describe('<DistributionScatter />', () => {
  it('desenha um ponto por análise no tempo, com os discrepantes à parte e a legenda (CA7)', () => {
    render(<DistributionScatter entity={entity('tsqmi', 'TSQMI', 'tsqmi')} />);

    const card = screen.getByRole('region', { name: 'Dispersão das análises no tempo' });
    expect(chart().xAxis).toMatchObject({ type: 'time' });
    expect(chart().yAxis).toMatchObject({ min: 0, max: 1 });
    expect(chart().points).toHaveLength(4);
    expect(chart().outliers.map(([, value]: number[]) => value)).toEqual([0.31, 0.9]);
    expect(chart().legend).toEqual(['Análise', 'Valor discrepante', 'Q1 a Q3']);
    expect(card).toHaveTextContent('A faixa clara vai do Q1 ao Q3');
  });

  it('com 1 análise, o eixo de tempo vai de um dia antes a um dia depois, com a data completa', () => {
    render(<DistributionScatter entity={entity('tsqmi', 'TSQMI', 'tsqmi', [0.85])} />);

    const day = 24 * 60 * 60 * 1000;
    const date = new Date('2026-08-17T10:00:00-03:00').getTime();
    expect(chart().xAxis).toMatchObject({ type: 'time', min: date - day, max: date + day });
    expect(chart().points).toEqual([[date, 0.85]]);
  });

  it('numa métrica, o eixo y segue a escala dela', () => {
    render(
      <DistributionScatter entity={entity('total_issues', 'total_issues', 'metric', [42, 44, 47, 55, 63], 'INT')} />
    );

    expect(chart().yAxis).toMatchObject({ min: 40, max: 65 });
  });
});

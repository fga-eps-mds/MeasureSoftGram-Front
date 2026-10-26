import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DistributionDensity from '../DistributionDensity';
import { entity } from './fixtures';

type ChartOption = {
  xAxis: unknown;
  yAxis: unknown;
  aria: { label: { description: string } };
  legend: { data: string[] };
  series: { data: number[][] }[];
};

// o ECharts não roda no jsdom: o mock mostra o eixo, a legenda e a curva que o gráfico receberia
jest.mock('next/dynamic', () => () => ({ option }: { option: ChartOption }) => (
  <div data-testid="echarts">
    {JSON.stringify({
      xAxis: option.xAxis,
      yAxis: option.yAxis,
      aria: option.aria.label.description,
      legend: option.legend.data,
      curve: option.series[0].data
    })}
  </div>
));

function chart() {
  return JSON.parse(screen.getByTestId('echarts').textContent ?? '{}');
}

describe('<DistributionDensity />', () => {
  it('desenha a curva no eixo de 0 a 1, com a mediana na legenda e a frase da área (CA5)', () => {
    render(<DistributionDensity entity={entity('tsqmi', 'TSQMI', 'tsqmi')} />);

    const card = screen.getByRole('region', { name: 'Curva de densidade' });
    expect(chart().xAxis).toMatchObject({ min: 0, max: 1, interval: 0.1 });
    expect(chart().legend).toEqual(['Densidade', 'Mediana (0,56)']);
    expect(chart().curve[0][0]).toBe(0);
    expect(card).toHaveTextContent('A área sob a curva soma 1');
  });

  it('numa métrica, segue a escala dela, como o histograma', () => {
    render(
      <DistributionDensity entity={entity('total_issues', 'total_issues', 'metric', [42, 44, 47, 55, 63], 'INT')} />
    );

    expect(chart().xAxis).toMatchObject({ min: 40, max: 65, interval: 5 });
    expect(chart().curve.at(-1)[0]).toBe(65);
  });

  it('numa métrica, não mostra os rótulos do eixo y, que repetiam "0", e o texto acessível continua descrevendo a curva', () => {
    render(
      <DistributionDensity
        entity={entity(
          'sum_ci_feedback_times',
          'Sum of time in seconds on builds',
          'metric',
          [12000, 18000, 24000, 26000, 85000],
          'INT'
        )}
      />
    );

    expect(chart().yAxis).toMatchObject({ axisLabel: { show: false }, axisTick: { show: false } });
    expect(chart().aria).toMatch(
      /^Curva de densidade de Sum of time in seconds on builds, de 10\.000 a 90\.000, com o pico em/
    );
  });

  it('com menos de 3 análises, explica que faltam análises (CA9)', () => {
    render(<DistributionDensity entity={entity('tsqmi', 'TSQMI', 'tsqmi', [0.5, 0.6])} />);

    expect(screen.queryByTestId('echarts')).not.toBeInTheDocument();
    expect(screen.getByText('Faltam análises para a curva de densidade')).toBeInTheDocument();
    expect(screen.getByText(/precisa de pelo menos 3 análises, e o período tem 2 análises/)).toBeInTheDocument();
  });

  it('com todas as análises iguais, explica que faltam valores diferentes (CA9)', () => {
    render(<DistributionDensity entity={entity('tsqmi', 'TSQMI', 'tsqmi', [0.7, 0.7, 0.7, 0.7])} />);

    expect(screen.queryByTestId('echarts')).not.toBeInTheDocument();
    expect(screen.getByText('Faltam análises com valores diferentes para a curva')).toBeInTheDocument();
    expect(screen.getByText(/As 4 análises do período têm o mesmo valor/)).toBeInTheDocument();
  });
});

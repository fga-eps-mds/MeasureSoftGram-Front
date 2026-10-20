import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ReleaseEvolutionChart, { formatReleaseEvolutionOptions } from '../ReleaseEvolutionChart';

jest.mock('next/dynamic', () => () => {
  function MockECharts() {
    return <div data-testid="echarts-mock" />;
  }
  return MockECharts;
});

const series = [{ key: 'reliability', name: 'Reliability', values: [0.4, null, 0.8] }];
const releaseNames = ['v1', 'v2', 'v3'];

describe('<ReleaseEvolutionChart />', () => {
  it('desenha o gráfico quando há valores', () => {
    render(<ReleaseEvolutionChart title="Características" releaseNames={releaseNames} series={series} emptyMessage="vazio" />);

    expect(screen.getByText('Características')).toBeTruthy();
    expect(screen.getByTestId('echarts-mock')).toBeTruthy();
  });

  it('mostra o carregamento', () => {
    render(<ReleaseEvolutionChart title="Medidas" releaseNames={[]} series={[]} isLoading emptyMessage="vazio" />);

    expect(screen.getByRole('progressbar')).toBeTruthy();
  });

  it('mostra a mensagem de sem dados', () => {
    render(<ReleaseEvolutionChart title="Medidas" releaseNames={releaseNames} series={[]} emptyMessage="Nada por aqui." />);

    expect(screen.getByText('Nada por aqui.')).toBeTruthy();
    expect(screen.queryByTestId('echarts-mock')).toBeNull();
  });

  it('mostra erro sem detalhes técnicos e tenta de novo', () => {
    const onRetry = jest.fn();
    render(
      <ReleaseEvolutionChart title="Métricas" releaseNames={releaseNames} series={series} hasError onRetry={onRetry} emptyMessage="vazio" />
    );

    expect(screen.getByText('Não foi possível carregar este gráfico.')).toBeTruthy();
    fireEvent.click(screen.getByText('Tentar novamente'));
    expect(onRetry).toHaveBeenCalled();
  });
});

describe('formatReleaseEvolutionOptions', () => {
  it('usa uma categoria por release e deixa a release sem valor como buraco na linha', () => {
    const options = formatReleaseEvolutionOptions(releaseNames, series, true);

    expect(options.xAxis.data).toEqual(releaseNames);
    expect(options.series[0]).toMatchObject({ name: 'Reliability', type: 'line', data: [0.4, null, 0.8], connectNulls: false });
    expect(options.yAxis.max).toBe(1);
  });

  it('deixa o eixo livre para métricas', () => {
    expect(formatReleaseEvolutionOptions(releaseNames, series, false).yAxis.max).toBeUndefined();
  });

  it('mostra "sem dado" no tooltip da release sem valor', () => {
    const { valueFormatter } = formatReleaseEvolutionOptions(releaseNames, series, true).tooltip;

    expect(valueFormatter(null)).toBe('sem dado');
    expect(valueFormatter(0.456)).toBe('0.46');
  });
});

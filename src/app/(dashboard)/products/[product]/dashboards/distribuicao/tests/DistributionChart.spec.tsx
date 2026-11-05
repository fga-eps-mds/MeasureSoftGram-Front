import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DistributionChart from '../DistributionChart';

// o ECharts não roda no jsdom: os botões disparam o onChartReady (1º desenho) e o evento 'finished' (os seguintes)
jest.mock('next/dynamic', () => () => {
  function MockECharts({ onChartReady, onEvents }: { onChartReady: () => void; onEvents: { finished: () => void } }) {
    return (
      <>
        <button type="button" onClick={onChartReady}>
          pronto
        </button>
        <button type="button" onClick={onEvents.finished}>
          desenhou
        </button>
      </>
    );
  }
  return MockECharts;
});

describe('<DistributionChart />', () => {
  let now = 0;

  beforeEach(() => {
    now = 0;
    jest.spyOn(performance, 'now').mockImplementation(() => now);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('mede do momento em que a option chega até o primeiro desenho', () => {
    render(<DistributionChart option={{ series: [] }} height={300} />);
    const chart = screen.getByTestId('distribution-chart');

    expect(chart).not.toHaveAttribute('data-render-ms');

    now = 12;
    fireEvent.click(screen.getByRole('button', { name: 'pronto' }));

    expect(chart).toHaveAttribute('data-render-ms', '12');
  });

  it('ignora os redesenhos da mesma option e mede de novo quando a option muda', () => {
    const { rerender } = render(<DistributionChart option={{ series: [] }} height={300} />);
    now = 12;
    fireEvent.click(screen.getByRole('button', { name: 'pronto' }));
    now = 40;
    fireEvent.click(screen.getByRole('button', { name: 'desenhou' }));

    expect(screen.getByTestId('distribution-chart')).toHaveAttribute('data-render-ms', '12');

    rerender(<DistributionChart option={{ series: [{ type: 'boxplot' }] }} height={300} />);
    now = 45;
    fireEvent.click(screen.getByRole('button', { name: 'desenhou' }));

    expect(screen.getByTestId('distribution-chart')).toHaveAttribute('data-render-ms', '5');
  });
});

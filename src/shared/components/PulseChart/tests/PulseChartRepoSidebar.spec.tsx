import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { COLOR_TOKENS } from '@utils/formatPulseChart';
import { PulseChartRepoSidebar } from '../PulseChartRepoSidebar';

const measurements = [
  { created_at: '2026-08-01T12:00:00Z', value: 0.5 },
  { created_at: '2026-08-20T12:00:00Z', value: 0.66 },
];

describe('<PulseChartRepoSidebar />', () => {
  it('sem release de referência, mostra a variação em relação à medição anterior', () => {
    const { getByText, queryByText } = render(
      <PulseChartRepoSidebar name="CLI" measurements={measurements} topOffset={0} valueLabel="último valor" />
    );

    expect(getByText('0.660')).toBeInTheDocument();
    expect(getByText(/▲ 32.00%/)).toBeInTheDocument();
    expect(getByText('último valor · Muito bom')).toBeInTheDocument();
    expect(queryByText(/vs\./)).not.toBeInTheDocument();
  });

  it('com release de referência, mostra a variação em relação a ela numa linha própria', () => {
    const { getByText } = render(
      <PulseChartRepoSidebar
        name="CLI"
        measurements={measurements}
        topOffset={0}
        valueLabel="último indicador TSQMI"
        reference={{ name: 'Release 1', value: 0.6 }}
      />
    );

    const variation = getByText('▲ 10,00% vs. Release 1');
    expect(variation).toHaveStyle({ color: COLOR_TOKENS.adequate });
    expect(getByText('último indicador TSQMI · muito bom')).toBeInTheDocument();
  });

  it('com a referência igual a 0, não mostra percentual', () => {
    const { queryByText, getByText } = render(
      <PulseChartRepoSidebar name="CLI" measurements={measurements} topOffset={0} reference={{ name: 'R', value: 0 }} />
    );

    expect(queryByText(/vs\. R/)).not.toBeInTheDocument();
    expect(getByText('último TSQMI · muito bom')).toBeInTheDocument();
  });
});

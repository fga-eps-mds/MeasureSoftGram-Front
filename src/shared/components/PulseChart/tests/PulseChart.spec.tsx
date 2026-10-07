import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import PulseChart from '../PulseChart';

jest.mock('../usePulseChartData', () => ({
  usePulseChartData: () => ({
    allRepositories: [
      { id: 1, name: '2022-1-MeasureSoftGram-CLI' },
      { id: 2, name: '2022-1-MeasureSoftGram-Front' },
    ],
    filteredRepositories: [
      {
        id: 1,
        name: '2022-1-MeasureSoftGram-CLI',
        measurements: [{ created_at: '2026-08-21T12:00:00Z', value: 0.918 }],
        releases: [{ name: 'Release 1', version: 'v2025.3.0', end_at: '2026-08-21T12:00:00Z' }],
      },
    ],
    selectedRepo: 'all',
    setSelectedRepo: jest.fn(),
    startDate: '',
    setStartDate: jest.fn(),
    endDate: '',
    setEndDate: jest.fn(),
    totalMeasurements: 50,
    selectedMeasurements: 10,
    latestDate: '2026-09-25',
    isLoading: false,
    error: null,
  }),
}));

jest.mock('next/dynamic', () => () => {
  const MockECharts = () => <div data-testid="echarts-mock" />;
  return MockECharts;
});

describe('<PulseChart />', () => {
  it('renders pulse chart header, legend and summary correctly', () => {
    const { getByText } = render(<PulseChart organizationId="1" productId="1" />);

    expect(getByText('Gráfico MSG — Evolução de Qualidade')).toBeInTheDocument();
    expect(getByText('Crítico (< 0,40)')).toBeInTheDocument();
    expect(getByText('Atenção (0,40–0,69)')).toBeInTheDocument();
    expect(getByText('Adequado (≥ 0,70)')).toBeInTheDocument();
    expect(getByText('2022-1-MeasureSoftGram-CLI')).toBeInTheDocument();
    expect(getByText('0.918')).toBeInTheDocument();
    expect(getByText('Renderizado com Apache ECharts')).toBeInTheDocument();
  });
});

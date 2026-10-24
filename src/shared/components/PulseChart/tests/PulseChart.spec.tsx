import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { downloadCsv } from '@utils/exportCsv';
import PulseChart from '../PulseChart';

const mockUsePulseChartData = jest.fn();

jest.mock('@utils/exportCsv', () => ({ downloadCsv: jest.fn(), downloadCsvZip: jest.fn() }));
jest.mock('../usePulseChartData', () => ({
  usePulseChartData: () => mockUsePulseChartData(),
}));

const defaultChartData = () => ({
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
});

jest.mock('next/dynamic', () => () => {
  const MockECharts = () => <div data-testid="echarts-mock" />;
  return MockECharts;
});

describe('<PulseChart />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePulseChartData.mockReturnValue(defaultChartData());
  });

  it('mostra o carregamento enquanto busca os dados', () => {
    mockUsePulseChartData.mockReturnValue({ ...defaultChartData(), isLoading: true });

    const { getByRole } = render(<PulseChart organizationId="1" productId="1" />);

    expect(getByRole('progressbar')).toBeInTheDocument();
  });

  it('mostra um alerta quando a busca falha', () => {
    mockUsePulseChartData.mockReturnValue({ ...defaultChartData(), error: new Error('falhou') });

    const { getByText } = render(<PulseChart organizationId="1" productId="1" />);

    expect(getByText('Não foi possível carregar os dados do gráfico de pulso.')).toBeInTheDocument();
  });

  it('exporta os repositórios filtrados em CSV pelo botão padrão dos dashboards', () => {
    const { getByRole } = render(<PulseChart organizationId="1" productId="1" />);
    fireEvent.click(getByRole('button', { name: 'Exportar .csv' }));

    expect(downloadCsv).toHaveBeenCalledTimes(1);
    const [dashboard, chart] = (downloadCsv as jest.Mock).mock.calls[0];
    expect(dashboard).toBe('produto');
    expect(chart.name).toBe('pulso');
    expect(chart.rows).toEqual([
      { repository: '2022-1-MeasureSoftGram-CLI', date: '2026-08-21T12:00:00Z', value: 0.918, grade: 'A' },
    ]);
  });

  it('deixa o botão de exportar desabilitado quando não há repositórios filtrados', () => {
    mockUsePulseChartData.mockReturnValue({ ...defaultChartData(), filteredRepositories: [] });

    const { getByRole } = render(<PulseChart organizationId="1" productId="1" />);

    expect(getByRole('button', { name: 'Exportar .csv' })).toBeDisabled();
  });

  it('renders pulse chart header, legend and summary correctly', () => {
    const { getByText } = render(<PulseChart organizationId="1" productId="1" />);

    expect(getByText('Gráfico MSG — Evolução de Qualidade')).toBeInTheDocument();
    expect(getByText('A · Ótimo (0,80 a 1,00)')).toBeInTheDocument();
    expect(getByText('B · Muito bom (0,60 a 0,79)')).toBeInTheDocument();
    expect(getByText('C · Bom (0,40 a 0,59)')).toBeInTheDocument();
    expect(getByText('D · Ruim (0,20 a 0,39)')).toBeInTheDocument();
    expect(getByText('E · Muito ruim (0,00 a 0,19)')).toBeInTheDocument();
    expect(getByText('2022-1-MeasureSoftGram-CLI')).toBeInTheDocument();
    expect(getByText('0.918')).toBeInTheDocument();
    expect(getByText('Renderizado com Apache ECharts')).toBeInTheDocument();
  });
});

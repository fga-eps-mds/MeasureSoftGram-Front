import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { downloadCsv } from '@utils/exportCsv';
import PulseChart, { getReferenceRelease } from '../PulseChart';

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
  selectedMeasurements: 10,
  latestDate: '25/09/2026',
  releasesInPeriod: 2,
  isLoading: false,
  error: null,
});

const mockEchartsOption = jest.fn();

jest.mock('next/dynamic', () => () => {
  const MockECharts = ({ option, notMerge }: { option: unknown; notMerge?: boolean }) => {
    mockEchartsOption(option, notMerge);
    return <div data-testid="echarts-mock" />;
  };
  return MockECharts;
});

describe('<PulseChart />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePulseChartData.mockReturnValue(defaultChartData());
  });

  it('refaz o gráfico a cada atualização, sem mesclar com as faixas do filtro anterior', () => {
    render(<PulseChart organizationId="1" productId="1" />);

    const [, notMerge] = mockEchartsOption.mock.calls[mockEchartsOption.mock.calls.length - 1];
    expect(notMerge).toBe(true);
  });

  it('desenha o pulso sem linhas horizontais e sem a etiqueta de início das releases', () => {
    mockUsePulseChartData.mockReturnValue({
      ...defaultChartData(),
      filteredRepositories: [
        {
          ...defaultChartData().filteredRepositories[0],
          releases: [
            { name: 'Release 1', version: 'Release 1', start_at: '2026-08-01T12:00:00Z', end_at: '2026-08-21T12:00:00Z' },
          ],
        },
      ],
    });

    render(<PulseChart organizationId="1" productId="1" />);

    const option = mockEchartsOption.mock.calls[mockEchartsOption.mock.calls.length - 1][0];
    expect(option.yAxis[0].splitLine.show).toBe(false);
    expect(option.series[0].markLine.data.map((line: any) => [line.name, line.label.show])).toEqual([
      ['Início Release 1', false],
      ['Release 1', true],
    ]);
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
    const { getByText, queryByText } = render(<PulseChart organizationId="1" productId="1" />);

    expect(getByText('Gráfico MSG — Evolução de Qualidade por Release')).toBeInTheDocument();
    expect(getByText(/ponto = indicador consolidado no encerramento da Release/)).toBeInTheDocument();
    expect(getByText('A · Ótimo (0,80 a 1,00)')).toBeInTheDocument();
    expect(getByText('B · Muito bom (0,60 a 0,79)')).toBeInTheDocument();
    expect(getByText('C · Bom (0,40 a 0,59)')).toBeInTheDocument();
    expect(getByText('D · Ruim (0,20 a 0,39)')).toBeInTheDocument();
    expect(getByText('E · Muito ruim (0,00 a 0,19)')).toBeInTheDocument();
    expect(getByText('2022-1-MeasureSoftGram-CLI')).toBeInTheDocument();
    expect(getByText('0.918')).toBeInTheDocument();
    expect(
      getByText(/1 repositório • 10 medições no período selecionado • 2 Releases no período • última medição: 25\/09\/2026/)
    ).toBeInTheDocument();
    expect(queryByText('Renderizado com Apache ECharts')).not.toBeInTheDocument();
  });

  it('mostra a legenda da pior para a melhor faixa', () => {
    const { getAllByText } = render(<PulseChart organizationId="1" productId="1" />);

    expect(getAllByText(/^[A-E] · /).map((el) => el.textContent?.[0])).toEqual(['E', 'D', 'C', 'B', 'A']);
  });

  it('põe o botão de exportar logo depois do filtro de período', () => {
    const { getByRole, getByLabelText } = render(<PulseChart organizationId="1" productId="1" />);

    const endDate = getByLabelText('Até');
    const exportButton = getByRole('button', { name: 'Exportar .csv' });
    // eslint-disable-next-line no-bitwise
    expect(endDate.compareDocumentPosition(exportButton) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('mostra na barra lateral a variação em relação à última release com indicador', () => {
    mockUsePulseChartData.mockReturnValue({
      ...defaultChartData(),
      filteredRepositories: [
        {
          ...defaultChartData().filteredRepositories[0],
          releases: [
            { id: 1, name: 'v2025.4.0 Release 2', version: 'v2025.4.0 Release 2', end_at: '2026-08-20T12:00:00Z', tsqmi: { value: 0.95 } },
            { id: 2, name: 'Release 3', version: 'Release 3', end_at: '2026-08-21T12:00:00Z', tsqmi: { value: null } },
          ],
        },
      ],
    });

    const { getByText } = render(<PulseChart organizationId="1" productId="1" />);

    // 0,918 contra 0,95: −3,37%; a Release 3 não tem indicador
    expect(getByText('▼ 3,37% vs. v2025.4.0 Release 2')).toBeInTheDocument();
    expect(getByText('último indicador TSQMI · ótimo')).toBeInTheDocument();
  });

  it('a variação da barra lateral não usa a release cuja janela inclui a última medição', () => {
    const tsqmi = (value: number) => ({ value });
    const releases = [
      { id: 1, name: 'Release 1', version: 'Release 1', end_at: '2026-08-10T12:00:00Z', tsqmi: tsqmi(0.9) },
      // encerra depois da última medição (21/08): o indicador dela é essa mesma medição
      { id: 2, name: 'Release 2', version: 'Release 2', end_at: '2026-09-30T12:00:00Z', tsqmi: tsqmi(0.918) },
    ];

    expect(getReferenceRelease(releases, [{ created_at: '2026-08-21T12:00:00Z', value: 0.918 }])).toEqual({
      name: 'Release 1',
      value: 0.9,
    });
    expect(getReferenceRelease(releases.slice(1), [{ created_at: '2026-08-21T12:00:00Z', value: 0.918 }])).toBeUndefined();
  });

  it('mostra a etiqueta das releases em todas as faixas', () => {
    const repo = {
      ...defaultChartData().filteredRepositories[0],
      releases: [{ id: 1, name: 'Release 1', version: 'Release 1', end_at: '2026-08-21T12:00:00Z' }],
    };
    mockUsePulseChartData.mockReturnValue({ ...defaultChartData(), filteredRepositories: [repo, { ...repo, id: 2 }] });

    render(<PulseChart organizationId="1" productId="1" />);

    const option = mockEchartsOption.mock.calls[mockEchartsOption.mock.calls.length - 1][0];
    expect(option.series.map((series: any) => series.markLine.data[0].label.show)).toEqual([true, true]);
  });
});

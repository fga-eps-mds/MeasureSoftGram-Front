import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRequest } from '@hooks/useRequest';
import { downloadCsv } from '@utils/exportCsv';
import { formatRepositoryPulseCsv } from '@utils/formatPulseCsv';
import { useRepositoryPulse } from '../../../hooks/useRepositoryPulse';
import RepositoryPulseChart from '../RepositoryPulseChart';
import { PULSE_POINTS_PER_MEASUREMENT } from '@utils/toPulseSeries';

jest.mock('@hooks/useRequest', () => ({ useRequest: jest.fn() }));
jest.mock('@utils/exportCsv', () => ({ downloadCsv: jest.fn(), downloadCsvZip: jest.fn() }));
jest.mock('@hooks/useProviderTerms', () => ({
  useProviderTerms: () => ({ terms: { Repository: 'Repositório', repository: 'repositório' } }),
}));
type MockOption = {
  height: number;
  grid: { height: number }[];
  yAxis: { splitLine: { show: boolean } }[];
  series: { name: string; data: unknown[]; markLine: { data: { name: string; label: { show: boolean } }[] } }[];
};
jest.mock('@components/ECharts', () => ({
  __esModule: true,
  default: ({ option }: { option: MockOption }) => (
    <div data-testid="echarts">
      {option.series.map((series) => `${series.name}:${series.data.length / PULSE_POINTS_PER_MEASUREMENT}`).join('|')}
      <span data-testid="grid-height">{option.grid[0].height}</span>
      <span data-testid="horizontal-lines">{String(option.yAxis.some((axis) => axis.splitLine.show))}</span>
      <span data-testid="release-labels">
        {option.series
          .map((series) => series.markLine.data.filter((line) => line.label.show).map((line) => line.name))
          .join('|')}
      </span>
    </div>
  ),
}));

const characteristics = {
  results: [
    {
      id: 1,
      key: 'reliability',
      name: 'Reliability',
      history: [
        { value: 0.3, created_at: '2026-03-01T10:00:00' },
        { value: 0.5, created_at: '2026-03-10T10:00:00' },
      ],
    },
    { id: 2, key: 'maintainability', name: 'Maintainability', history: [{ value: 0.8, created_at: '2026-03-12T10:00:00' }] },
    { id: 3, key: 'functional_suitability', name: 'Functional Suitability', history: [] },
  ],
};
const releases = {
  results: [
    { id: 1, release_name: 'v1 Release 1', start_at: '2026-03-01T00:00:00', end_at: '2026-03-15T00:00:00', repositories_ids: [7] },
    { id: 2, release_name: 'outro repo', start_at: '2026-03-01T00:00:00', end_at: '2026-03-15T00:00:00', repositories_ids: [9] },
    { id: 3, release_name: 'todos', start_at: '2026-03-16T00:00:00', end_at: '2026-03-30T00:00:00', repositories_ids: [] },
  ],
};

type Request = { url: string } | null;
let responses: (request: NonNullable<Request>) => { data?: unknown; error?: unknown; isLoading?: boolean };
const mutate = jest.fn();
const defaultResponse = (request: NonNullable<Request>) =>
  request.url.endsWith('/release/') ? { data: releases } : { data: characteristics };

// a página sobe o hook e o CSV para o botão do topo e o do card usarem os mesmos dados
function PulseWithData() {
  const pulse = useRepositoryPulse('1', '2', 7);
  return <RepositoryPulseChart pulse={pulse} csv={formatRepositoryPulseCsv('api', pulse.rows)} />;
}

const renderChart = () => render(<PulseWithData />);

describe('<RepositoryPulseChart />', () => {
  beforeEach(() => {
    responses = defaultResponse;
    mutate.mockReset();
    jest.clearAllMocks();
    (useRequest as jest.Mock).mockImplementation((request: Request) =>
      request ? { isLoading: false, mutate, ...responses(request) } : { isLoading: false, mutate }
    );
  });

  it('desenha uma faixa de pulso por característica com medições, na altura do pulso do produto', () => {
    renderChart();

    expect(screen.getByTestId('echarts').firstChild?.textContent).toBe('Reliability:2|Maintainability:1');
    expect(screen.getByTestId('grid-height').textContent).toBe('82');
    expect(useRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/v1/organizations/1/products/2/repositories/7/historical-values/characteristics/' })
    );
  });

  it('mostra o último valor e a faixa de cada característica ao lado do pulso', () => {
    renderChart();

    expect(screen.getByText('0.500')).toBeTruthy();
    expect(screen.getByText('0.800')).toBeTruthy();
    expect(screen.getAllByText(/último valor/)).toHaveLength(2);
    expect(screen.getByText('A · Ótimo (0,80 a 1,00)')).toBeTruthy();
  });

  it('marca as releases do repositório, com o nome uma vez só e sem linhas horizontais', () => {
    renderChart();

    expect(screen.getByTestId('release-labels').textContent).toBe(
      'Início v1 Release 1,v1 Release 1,Início todos,todos|'
    );
    expect(screen.getByTestId('horizontal-lines').textContent).toBe('false');
  });

  it('filtra as medições pelo período', () => {
    renderChart();

    const [start] = screen.getAllByDisplayValue('');
    fireEvent.change(start, { target: { value: '2026-03-05' } });
    expect(screen.getByTestId('echarts').firstChild?.textContent).toBe('Reliability:1|Maintainability:1');

    fireEvent.change(start, { target: { value: '2026-04-01' } });
    expect(screen.getByText(/Nenhuma medição no período selecionado/)).toBeTruthy();
  });

  it('exporta as medições de cada característica pelo botão padrão dos dashboards', () => {
    renderChart();

    fireEvent.click(screen.getByRole('button', { name: 'Exportar .csv' }));

    const [dashboard, chart] = (downloadCsv as jest.Mock).mock.calls[0];
    expect(dashboard).toBe('repositorio');
    expect(chart.name).toBe('pulso');
    expect(chart.rows).toEqual([
      { repository: 'api', characteristic: 'Reliability', date: '2026-03-01T10:00:00', value: 0.3, grade: 'D' },
      { repository: 'api', characteristic: 'Reliability', date: '2026-03-10T10:00:00', value: 0.5, grade: 'C' },
      { repository: 'api', characteristic: 'Maintainability', date: '2026-03-12T10:00:00', value: 0.8, grade: 'A' },
    ]);
  });

  it('exporta só as medições do período filtrado e desabilita o botão quando o período não tem nenhuma', () => {
    renderChart();
    const [start] = screen.getAllByDisplayValue('');

    fireEvent.change(start, { target: { value: '2026-03-05' } });
    fireEvent.click(screen.getByRole('button', { name: 'Exportar .csv' }));
    expect((downloadCsv as jest.Mock).mock.calls[0][1].rows.map((row: { value: number }) => row.value)).toEqual([0.5, 0.8]);

    fireEvent.change(start, { target: { value: '2026-04-01' } });
    expect(screen.getByRole('button', { name: 'Exportar .csv' })).toBeDisabled();
  });

  it('não oferece o botão de exportar enquanto carrega nem quando dá erro', () => {
    responses = () => ({ isLoading: true });
    const { unmount } = renderChart();
    expect(screen.queryByRole('button', { name: 'Exportar .csv' })).toBeNull();
    unmount();

    responses = (request) => (request.url.endsWith('/release/') ? { data: releases } : { error: new Error('500') });
    renderChart();
    expect(screen.queryByRole('button', { name: 'Exportar .csv' })).toBeNull();
  });

  it('mostra o carregamento', () => {
    responses = () => ({ isLoading: true });

    renderChart();

    expect(screen.getByText('Carregando as medições das características…')).toBeTruthy();
  });

  it('explica o que fazer quando o repositório ainda não tem medições', () => {
    responses = (request) => (request.url.endsWith('/release/') ? { data: releases } : { data: { results: [] } });

    renderChart();

    expect(screen.getByText('Ainda não há medições das características deste repositório')).toBeTruthy();
  });

  it('mostra o erro com "Tentar novamente"', () => {
    responses = (request) => (request.url.endsWith('/release/') ? { data: releases } : { error: new Error('500') });

    renderChart();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(screen.getByText('Não foi possível carregar o indicador das características')).toBeTruthy();
    expect(mutate).toHaveBeenCalledTimes(2);
  });
});

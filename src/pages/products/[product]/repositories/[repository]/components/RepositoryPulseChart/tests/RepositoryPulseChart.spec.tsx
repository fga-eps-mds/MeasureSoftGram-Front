import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { useRequest } from '@hooks/useRequest';
import RepositoryPulseChart from '../RepositoryPulseChart';

jest.mock('@hooks/useRequest', () => ({ useRequest: jest.fn() }));
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
      {option.series.map((series) => `${series.name}:${series.data.length / 3}`).join('|')}
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

const renderChart = () => render(<RepositoryPulseChart organizationId="1" productId="2" repositoryId={7} />);

describe('<RepositoryPulseChart />', () => {
  beforeEach(() => {
    responses = defaultResponse;
    mutate.mockReset();
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

  it('exporta as medições em .csv', () => {
    const createObjectURL = jest.fn(() => 'blob:csv');
    Object.assign(window.URL, { createObjectURL, revokeObjectURL: jest.fn() });
    const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);

    renderChart();
    fireEvent.click(screen.getByRole('button', { name: /exportar .csv/ }));

    expect(createObjectURL).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
    click.mockRestore();
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

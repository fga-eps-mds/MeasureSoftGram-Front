import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { useRequest } from '@hooks/useRequest';
import { useReleaseEvolution } from '@hooks/useReleaseEvolution';
import TemporalDashboard from '../TemporalDashboard';

jest.mock('next/router', () => ({ useRouter: () => ({ query: { product: '1-2-Produto' } }) }));
jest.mock('@components/Layout', () => ({ __esModule: true, default: (page: React.ReactNode) => page }));
jest.mock('@hooks/useRequireAuth', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@hooks/useProviderTerms', () => ({
  useProviderTerms: () => ({
    terms: { Repository: 'Repositório', repository: 'repositório', repositories: 'repositórios' },
  }),
}));
jest.mock('@hooks/useRequest', () => ({ useRequest: jest.fn() }));
jest.mock('@hooks/useReleaseEvolution', () => ({ useReleaseEvolution: jest.fn() }));
jest.mock('@components/ReleaseEvolutionChart', () => ({
  __esModule: true,
  default: ({ title, emptyMessage, series }: { title: string; emptyMessage: string; series: unknown[] }) => (
    <div data-testid={`chart-${title}`}>{series.length ? `${series.length} séries` : emptyMessage}</div>
  ),
}));

const repositories = [
  { id: 7, name: 'api' },
  { id: 9, name: 'web' },
];

function evolution(overrides = {}) {
  return {
    releaseNames: ['v1'],
    series: [{ key: 'reliability', name: 'Reliability', values: [0.5] }],
    hasReleases: true,
    isLoading: false,
    hasError: false,
    retry: jest.fn(),
    ...overrides,
  };
}

describe('<TemporalDashboard />', () => {
  beforeEach(() => {
    (useRequest as jest.Mock).mockReturnValue({ data: { results: repositories }, isLoading: false });
    (useReleaseEvolution as jest.Mock).mockReturnValue(evolution());
  });

  it('desenha os quatro gráficos do primeiro repositório', () => {
    render(<TemporalDashboard />);

    ['Características', 'Subcaracterísticas', 'Medidas', 'Métricas'].forEach((title) =>
      expect(screen.getByTestId(`chart-${title}`)).toBeTruthy()
    );
    expect(useReleaseEvolution).toHaveBeenCalledWith('1', '2', 7, 'characteristics');
    expect(useReleaseEvolution).toHaveBeenCalledWith('1', '2', 7, 'metrics');
    expect(screen.queryByTitle('Evolução Temporal')).toBeNull();
  });

  it('troca o repositório pelo seletor', () => {
    render(<TemporalDashboard />);

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Repositório' }));
    fireEvent.click(within(screen.getByRole('listbox')).getByText('web'));

    expect(useReleaseEvolution).toHaveBeenLastCalledWith('1', '2', 9, 'metrics');
  });

  it('orienta a criar uma release quando o produto não tem nenhuma', () => {
    (useReleaseEvolution as jest.Mock).mockReturnValue(evolution({ series: [], hasReleases: false }));

    render(<TemporalDashboard />);

    expect(screen.getByTestId('chart-Características').textContent).toMatch(/ainda não tem releases/);
  });

  it('explica o que fazer quando as releases não têm valores', () => {
    (useReleaseEvolution as jest.Mock).mockReturnValue(evolution({ series: [] }));

    render(<TemporalDashboard />);

    expect(screen.getByTestId('chart-Medidas').textContent).toMatch(/Nenhuma release tem valores de medidas deste repositório/);
  });

  it('mostra estado vazio quando o produto não tem repositórios', () => {
    (useRequest as jest.Mock).mockReturnValue({ data: { results: [] }, isLoading: false });

    render(<TemporalDashboard />);

    expect(screen.getByText(/ainda não tem repositórios/)).toBeTruthy();
    expect(screen.queryByTestId('chart-Características')).toBeNull();
  });
});

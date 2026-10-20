import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { useReleaseEvolution } from '@hooks/useReleaseEvolution';
import Repository from '../Repository';

jest.mock('next/router', () => ({ useRouter: () => ({ query: { product: '1-2-Produto', repository: '7-api' } }) }));
jest.mock('@hooks/useRequireAuth', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@hooks/useProviderTerms', () => ({
  useProviderTerms: () => ({ terms: { Repository: 'Repositório', repository: 'repositório' } }),
}));
jest.mock('@contexts/RepositoryProvider', () => ({
  useRepositoryContext: () => ({ latestTSQMI: { id: 1, value: 0.75 }, latestTSQMIBadgeUrl: 'badge-url' }),
}));
jest.mock('../hooks/useQuery', () => ({ useQuery: jest.fn() }));
jest.mock('../components/Header', () => () => <div data-testid="repository-header" />);
jest.mock('../components/TsqmiBadge', () => ({ latestTSQMIBadgeUrl }: { latestTSQMIBadgeUrl: string }) => (
  <div data-testid="tsqmi-badge">{latestTSQMIBadgeUrl}</div>
));
jest.mock('@hooks/useReleaseEvolution', () => ({ useReleaseEvolution: jest.fn() }));
jest.mock('next/dynamic', () => () => {
  function MockECharts({ option }: { option: { xAxis: { data: string[] } } }) {
    return <div data-testid="echarts-mock">{option.xAxis.data.join(',')}</div>;
  }
  return MockECharts;
});

function evolution(overrides = {}) {
  return {
    releaseNames: ['v1', 'v2'],
    series: [{ key: 'reliability', name: 'Reliability', values: [0.4, 0.6] }],
    hasReleases: true,
    isLoading: false,
    hasError: false,
    retry: jest.fn(),
    ...overrides,
  };
}

describe('<Repository />', () => {
  beforeEach(() => {
    (useReleaseEvolution as jest.Mock).mockReturnValue(evolution());
  });

  it('monta a tela com cabeçalho, TSQMI, evolução das características e espaço para as medidas', () => {
    render(<Repository />);

    expect(screen.getByTestId('repository-header')).toBeTruthy();
    expect(screen.getByTestId('tsqmi-badge').textContent).toBe('badge-url');
    expect(screen.getByText('Evolução das características')).toBeTruthy();
    expect(screen.getByTestId('repository-measures-section')).toBeTruthy();
    expect(document.querySelector('iframe')).toBeNull();
  });

  it('desenha um ponto por release das características do repositório da rota', () => {
    render(<Repository />);

    expect(useReleaseEvolution).toHaveBeenCalledWith('1', '2', 7, 'characteristics');
    expect(screen.getByTestId('echarts-mock').textContent).toBe('v1,v2');
  });

  it('mostra o carregamento', () => {
    (useReleaseEvolution as jest.Mock).mockReturnValue(evolution({ isLoading: true }));

    render(<Repository />);

    expect(screen.getByRole('progressbar')).toBeTruthy();
  });

  it('orienta a criar uma release quando o produto não tem nenhuma', () => {
    (useReleaseEvolution as jest.Mock).mockReturnValue(evolution({ series: [], releaseNames: [], hasReleases: false }));

    render(<Repository />);

    expect(screen.getByText(/ainda não tem releases/)).toBeTruthy();
  });

  it('explica o que fazer quando as releases não têm valores', () => {
    (useReleaseEvolution as jest.Mock).mockReturnValue(evolution({ series: [] }));

    render(<Repository />);

    expect(screen.getByText(/Nenhuma release tem valores de características deste repositório/)).toBeTruthy();
  });

  it('mostra erro com "Tentar novamente"', () => {
    const retry = jest.fn();
    (useReleaseEvolution as jest.Mock).mockReturnValue(evolution({ hasError: true, retry }));

    render(<Repository />);

    fireEvent.click(screen.getByText('Tentar novamente'));
    expect(retry).toHaveBeenCalled();
  });
});

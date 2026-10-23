import React from 'react';
import { render, screen } from '@testing-library/react';
import Repository from '../Repository';

jest.mock('next/router', () => ({ useRouter: () => ({ query: { product: '1-2-Produto', repository: '7-api' } }) }));
jest.mock('@hooks/useRequireAuth', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@hooks/useProviderTerms', () => ({
  useProviderTerms: () => ({ terms: { Repository: 'Repositório', repository: 'repositório' } }),
}));
jest.mock('@contexts/RepositoryProvider', () => ({
  useRepositoryContext: () => ({ latestTSQMI: { id: 1, value: 0.75 }, latestTSQMIBadgeUrl: 'badge-url' }),
}));
jest.mock('@components/ECharts', () => ({ __esModule: true, default: () => null, usePreloadECharts: jest.fn() }));
jest.mock('../hooks/useQuery', () => ({ useQuery: jest.fn() }));
jest.mock('../components/Header', () => () => <div data-testid="repository-header" />);
jest.mock('../components/TsqmiBadge', () => ({ latestTSQMIBadgeUrl }: { latestTSQMIBadgeUrl: string }) => (
  <div data-testid="tsqmi-badge">{latestTSQMIBadgeUrl}</div>
));
jest.mock('../components/RepositoryPulseChart', () => (props: Record<string, unknown>) => (
  <div data-testid="repository-pulse">{JSON.stringify(props)}</div>
));

describe('<Repository />', () => {
  it('monta a tela com cabeçalho, TSQMI, pulso das características e espaço para as medidas', () => {
    render(<Repository />);

    expect(screen.getByTestId('repository-header')).toBeTruthy();
    expect(screen.getByTestId('tsqmi-badge').textContent).toBe('badge-url');
    expect(screen.getByTestId('repository-measures-section')).toBeTruthy();
    expect(document.querySelector('iframe')).toBeNull();
  });

  it('desenha o pulso do repositório da rota', () => {
    render(<Repository />);

    expect(JSON.parse(screen.getByTestId('repository-pulse').textContent ?? '')).toEqual({
      organizationId: '1',
      productId: '2',
      repositoryId: 7,
    });
  });
});

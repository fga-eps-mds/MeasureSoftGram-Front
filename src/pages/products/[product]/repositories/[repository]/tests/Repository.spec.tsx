import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { downloadCsvZip } from '@utils/exportCsv';
import { useRepositoryPulse } from '../hooks/useRepositoryPulse';
import { useQuery } from '../hooks/useQuery';
import Repository from '../Repository';

jest.mock('next/router', () => ({ useRouter: () => ({ query: { product: '1-2-Produto', repository: '7-api' } }) }));
jest.mock('@hooks/useRequireAuth', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@hooks/useProviderTerms', () => ({
  useProviderTerms: () => ({ terms: { Repository: 'Repositório', repository: 'repositório', providerName: 'GitHub' } }),
}));
jest.mock('@contexts/RepositoryProvider', () => ({
  useRepositoryContext: () => ({
    currentRepository: { id: 7, name: 'api' },
    latestTSQMI: { id: 1, value: 0.75 },
    latestTSQMIBadgeUrl: 'badge-url',
  }),
}));
jest.mock('@utils/exportCsv', () => ({ downloadCsv: jest.fn(), downloadCsvZip: jest.fn() }));
jest.mock('../hooks/useRepositoryPulse', () => ({ useRepositoryPulse: jest.fn() }));
jest.mock('@components/ECharts', () => ({ __esModule: true, default: () => null, usePreloadECharts: jest.fn() }));
jest.mock('../hooks/useQuery', () => ({ useQuery: jest.fn() }));
jest.mock('../components/Header', () => () => <div data-testid="repository-header" />);
jest.mock('../components/TsqmiBadge', () => ({ latestTSQMIBadgeUrl }: { latestTSQMIBadgeUrl: string }) => (
  <div data-testid="tsqmi-badge">{latestTSQMIBadgeUrl}</div>
));
jest.mock('../components/RepositoryPulseChart', () => ({ csv }: { csv: { name: string; rows: unknown[] } }) => (
  <div data-testid="repository-pulse">{`${csv.name}:${csv.rows.length}`}</div>
));

const measurement = (value: number) => ({ created_at: '2026-03-01T10:00:00Z', value });
const pulseState = (overrides = {}) => ({
  rows: [{ id: 'reliability', name: 'Reliability', measurements: [measurement(0.5)], releases: [] }],
  hasMeasurements: true,
  isLoading: false,
  hasError: false,
  ...overrides,
});
const exportAllButton = () => screen.getByRole('button', { name: 'Exportar todos (.zip)' });

describe('<Repository />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRepositoryPulse as jest.Mock).mockReturnValue(pulseState());
    (useQuery as jest.Mock).mockReturnValue({ repositoryNotFound: false });
  });

  it('avisa que o usuário não tem acesso ao repositório no provedor quando o servidor responde 404', () => {
    (useQuery as jest.Mock).mockReturnValue({ repositoryNotFound: true });

    render(<Repository />);

    expect(screen.getByText('Você não tem acesso a este repositório no GitHub.')).toBeTruthy();
    expect(screen.queryByTestId('repository-header')).toBeNull();
  });

  it('monta a tela com cabeçalho, TSQMI, pulso das características e espaço para as medidas', () => {
    render(<Repository />);

    expect(screen.getByTestId('repository-header')).toBeTruthy();
    expect(screen.getByTestId('tsqmi-badge').textContent).toBe('badge-url');
    expect(screen.getByTestId('repository-measures-section')).toBeTruthy();
    expect(document.querySelector('iframe')).toBeNull();
  });

  it('desenha o pulso do repositório da rota', () => {
    render(<Repository />);

    expect(useRepositoryPulse).toHaveBeenCalledWith('1', '2', 7);
    expect(screen.getByTestId('repository-pulse').textContent).toBe('pulso:1');
  });

  it('exporta o pulso num .zip pelo botão do topo, com o nome do repositório', async () => {
    render(<Repository />);

    fireEvent.click(exportAllButton());
    await waitFor(() => expect(exportAllButton()).toBeEnabled());

    const [dashboard, charts] = (downloadCsvZip as jest.Mock).mock.calls[0];
    expect(dashboard).toBe('repositorio');
    expect(charts).toHaveLength(1);
    expect(charts[0].name).toBe('pulso');
    expect(charts[0].rows).toEqual([
      { repository: 'api', characteristic: 'Reliability', date: '2026-03-01T10:00:00Z', value: 0.5, grade: 'C' },
    ]);
  });

  it.each([
    ['sem medições no período', { rows: [] }],
    ['carregando', { isLoading: true }],
    ['com erro', { hasError: true }],
  ])('deixa o .zip desabilitado %s', (_label, overrides) => {
    (useRepositoryPulse as jest.Mock).mockReturnValue(pulseState(overrides));

    render(<Repository />);

    expect(exportAllButton()).toBeDisabled();
  });
});

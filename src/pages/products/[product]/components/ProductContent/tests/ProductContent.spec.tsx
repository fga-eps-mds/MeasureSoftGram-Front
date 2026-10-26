import React from 'react';
import { render, screen } from '@testing-library/react';
import { useRequest } from '@hooks/useRequest';
import ProductContent from '../ProductContent';

jest.mock('@hooks/useRequest', () => ({ useRequest: jest.fn() }));
jest.mock('@components/PulseChart', () => ({ PulseChart: () => <div data-testid="pulse-chart" /> }));
jest.mock('../NoReleasesState', () => () => <div data-testid="no-releases" />);
jest.mock('@contexts/ProductProvider', () => {
  const product = { id: '2', name: 'Produto' };
  return { useProductContext: () => ({ currentProduct: product }) };
});
let mockQuery: { product?: string } = { product: '1-2-Produto' };
jest.mock('next/router', () => ({ useRouter: () => ({ query: mockQuery }) }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

const WITH_RELEASES = { releases: [{ id: 1, release_name: 'Release 1' }], repositories: [] };
const WITHOUT_RELEASES = { releases: [], repositories: [] };

describe('<ProductContent />', () => {
  beforeEach(() => {
    mockQuery = { product: '1-2-Produto' };
  });

  it('mostra o skeleton enquanto a rota ainda nao tem o produto', () => {
    mockQuery = {};
    (useRequest as jest.Mock).mockReturnValue({ data: undefined, isLoading: false });

    const { container } = render(<ProductContent />);

    expect(container.querySelector('.MuiSkeleton-root')).not.toBeNull();
    expect(screen.queryByTestId('no-releases')).toBeNull();
  });

  it('mostra o skeleton enquanto as releases carregam', () => {
    (useRequest as jest.Mock).mockReturnValue({ data: undefined, isLoading: true });

    const { container } = render(<ProductContent />);

    expect(container.querySelector('.MuiSkeleton-root')).not.toBeNull();
    expect(screen.queryByTestId('pulse-chart')).toBeNull();
  });

  it('renderiza o grafico de pulso quando existem releases', () => {
    (useRequest as jest.Mock).mockReturnValue({ data: WITH_RELEASES, isLoading: false });

    const { container } = render(<ProductContent />);

    expect(screen.getByTestId('pulse-chart')).toBeTruthy();
    expect(container.querySelector('.MuiSkeleton-root')).toBeNull();
  });

  it('decide o empty state pelo historico do TSQMI por release', () => {
    (useRequest as jest.Mock).mockReturnValue({ data: WITH_RELEASES, isLoading: false });

    render(<ProductContent />);

    const urls = (useRequest as jest.Mock).mock.calls.map(([config]) => config?.url);
    expect(urls).toContain('/v1/organizations/1/products/2/repositories-tsqmi-release-history/');
    expect(urls).not.toContain('/v1/organizations/1/products/2/release/');
  });

  it('mostra como ultima atualizacao a medicao de TSQMI mais recente', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-09-25T18:00:00'));
    (useRequest as jest.Mock).mockImplementation((config: { url: string } | null) =>
      config?.url.includes('repositories-tsqmi-historical-values')
        ? {
            data: {
              results: [
                { id: 1, name: 'CLI', history: [{ created_at: '2026-09-24T10:00:00', value: 0.5 }] },
                { id: 2, name: 'Front', history: [{ created_at: '2026-09-25T14:56:00', value: 0.7 }] }
              ]
            }
          }
        : { data: WITH_RELEASES, isLoading: false }
    );

    render(<ProductContent />);

    expect(screen.getByText(/last-update: hoje às 14:56/)).toBeTruthy();
    jest.useRealTimers();
  });

  it('mostra traco na ultima atualizacao quando nao ha medicoes', () => {
    (useRequest as jest.Mock).mockReturnValue({ data: WITH_RELEASES, isLoading: false });

    render(<ProductContent />);

    expect(screen.getByText('last-update: -')).toBeTruthy();
  });

  it('renderiza NoReleasesState quando nao existem releases (Cenario 6)', () => {
    (useRequest as jest.Mock).mockReturnValue({ data: WITHOUT_RELEASES, isLoading: false });

    render(<ProductContent />);

    expect(screen.getByTestId('no-releases')).toBeTruthy();
    expect(screen.queryByTestId('pulse-chart')).toBeNull();
  });

  it('troca o empty state pelo grafico quando o produto passa a ter releases (Cenario 7)', () => {
    (useRequest as jest.Mock).mockReturnValue({ data: WITHOUT_RELEASES, isLoading: false });
    const { rerender } = render(<ProductContent />);
    expect(screen.getByTestId('no-releases')).toBeTruthy();

    (useRequest as jest.Mock).mockReturnValue({ data: WITH_RELEASES, isLoading: false });
    rerender(<ProductContent />);

    expect(screen.queryByTestId('no-releases')).toBeNull();
    expect(screen.getByTestId('pulse-chart')).toBeTruthy();
  });

  it('com erro no historico por release, deixa o grafico mostrar o alerta em vez do empty state', () => {
    (useRequest as jest.Mock).mockReturnValue({ data: undefined, isLoading: false, error: new Error('falhou') });

    render(<ProductContent />);

    expect(screen.queryByTestId('no-releases')).toBeNull();
    expect(screen.getByTestId('pulse-chart')).toBeTruthy();
  });
});

import { act, renderHook, waitFor } from '@testing-library/react';
import { useGrafanaDashboard } from '@hooks/useGrafanaDashboard';
import { grafanaService } from '@services/grafana';
import { productQuery } from '@services/product';

jest.mock('@services/grafana', () => ({
  grafanaService: {
    getDashboardUrl: jest.fn(),
  },
}));

jest.mock('@services/product', () => ({
  productQuery: {
    getAllRepositories: jest.fn(),
  },
}));

// Stable references — prevents useEffect infinite loop; tests may swap `current`
const mockProductState: { current: { id: string; name: string } } = {
  current: { id: '5', name: 'MyProduct' },
};
jest.mock('@contexts/ProductProvider', () => ({
  useProductContext: () => ({ currentProduct: mockProductState.current }),
}));

jest.mock('@contexts/OrganizationProvider', () => {
  const organization = { id: '2', name: 'MyOrg' };
  return { useOrganizationContext: () => ({ currentOrganization: organization }) };
});

describe('useGrafanaDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches dashboard URL without repo selector', async () => {
    (grafanaService.getDashboardUrl as jest.Mock).mockResolvedValue({
      data: { grafana_url: 'http://grafana/d/test' },
    });

    const { result } = renderHook(() => useGrafanaDashboard({ uid: 'test-uid' }));

    await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 3000 });

    expect(result.current.grafanaUrl).toBe('http://grafana/d/test');
    expect(result.current.error).toBe(false);
    expect(grafanaService.getDashboardUrl).toHaveBeenCalledWith('test-uid', 5, undefined);
  });

  it('fetches repositories and first repo URL when hasRepoSelector is true', async () => {
    const repos = [
      { id: 1, name: 'repo-a' },
      { id: 2, name: 'repo-b' },
    ];
    (productQuery.getAllRepositories as jest.Mock).mockResolvedValue({
      data: { results: repos },
    });
    (grafanaService.getDashboardUrl as jest.Mock).mockResolvedValue({
      data: { grafana_url: 'http://grafana/d/repo' },
    });

    const { result } = renderHook(() =>
      useGrafanaDashboard({ uid: 'repo-uid', hasRepoSelector: true })
    );

    await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 3000 });

    expect(result.current.repositories).toHaveLength(2);
    expect(result.current.selectedRepoId).toBe(1);
    expect(result.current.grafanaUrl).toBe('http://grafana/d/repo');
  });

  it('sets error state when API call fails', async () => {
    (grafanaService.getDashboardUrl as jest.Mock).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useGrafanaDashboard({ uid: 'fail-uid' }));

    await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 3000 });

    expect(result.current.error).toBe(true);
    expect(result.current.grafanaUrl).toBeNull();
  });

  it('uses fixed repositoryId when provided', async () => {
    (grafanaService.getDashboardUrl as jest.Mock).mockResolvedValue({
      data: { grafana_url: 'http://grafana/d/fixed' },
    });

    const { result } = renderHook(() =>
      useGrafanaDashboard({ uid: 'fixed-uid', repositoryId: 99 })
    );

    await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 3000 });

    expect(result.current.selectedRepoId).toBe(99);
    expect(grafanaService.getDashboardUrl).toHaveBeenCalledWith('fixed-uid', 5, 99);
  });

  describe('estabilidade', () => {
    afterEach(() => {
      mockProductState.current = { id: '5', name: 'MyProduct' };
    });

    it('não refaz a busca quando chega um novo objeto do mesmo produto', async () => {
      (grafanaService.getDashboardUrl as jest.Mock).mockResolvedValue({
        data: { grafana_url: 'http://grafana/d/same' },
      });

      const { result, rerender } = renderHook(() => useGrafanaDashboard({ uid: 'same-uid' }));
      await waitFor(() => expect(result.current.grafanaUrl).toBe('http://grafana/d/same'));

      mockProductState.current = { id: '5', name: 'MyProduct (novo objeto)' };
      rerender();

      expect(grafanaService.getDashboardUrl).toHaveBeenCalledTimes(1);
    });

    it('mantém a URL anterior durante uma nova busca e descarta a resposta antiga', async () => {
      const resolvers: Record<string, (value: unknown) => void> = {};
      (grafanaService.getDashboardUrl as jest.Mock).mockImplementation(
        (_uid: string, productId: number) =>
          new Promise((resolve) => {
            resolvers[productId] = resolve;
          })
      );

      const { result, rerender } = renderHook(() => useGrafanaDashboard({ uid: 'swap-uid' }));
      await act(async () => {
        resolvers[5]({ data: { grafana_url: 'http://grafana/d/p5' } });
      });
      expect(result.current.grafanaUrl).toBe('http://grafana/d/p5');

      mockProductState.current = { id: '6', name: 'Outro' };
      rerender();
      mockProductState.current = { id: '7', name: 'Mais um' };
      rerender();

      expect(result.current.loading).toBe(true);
      expect(result.current.grafanaUrl).toBe('http://grafana/d/p5');

      await act(async () => {
        resolvers[7]({ data: { grafana_url: 'http://grafana/d/p7' } });
      });
      await act(async () => {
        resolvers[6]({ data: { grafana_url: 'http://grafana/d/p6' } });
      });

      expect(result.current.grafanaUrl).toBe('http://grafana/d/p7');
      expect(result.current.loading).toBe(false);
    });
  });
});

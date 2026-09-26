import { renderHook, waitFor } from '@testing-library/react';
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

// Stable references inside factory — prevents useEffect infinite loop
// when currentProduct/currentOrganization are in the dep array
jest.mock('@contexts/ProductProvider', () => {
  const product = { id: '5', name: 'MyProduct' };
  return { useProductContext: () => ({ currentProduct: product }) };
});

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
});

import { act, renderHook } from '@testing-library/react';
import { useRequest } from '@hooks/useRequest';
import { useRequests } from '@hooks/useRequests';
import { FileMetricKey, MetricDistributionRepository } from '@customTypes/product';
import { useDistributionDashboard } from '../useDistributionDashboard';
import { action, commentsReference, distribution, front, releases, service, withFiles } from './fixtures';

jest.mock('@hooks/useRequest', () => ({ useRequest: jest.fn() }));
jest.mock('@hooks/useRequests', () => ({ useRequests: jest.fn() }));

type Params = { release_id?: number; metric?: FileMetricKey; repository_id?: number };
type Request = { url: string; params?: Params } | null;

const mutate = jest.fn();
const byId: Record<number, MetricDistributionRepository> = { 7: service, 9: front, 11: action };
const nonComplexReference = { measure: 'non_complex_file_density', min_threshold: 0, max_threshold: 10 };

/** Responde como o Service. Com stale, a lista ainda é a da complexidade, como no keepPreviousData do SWR. */
function mockRequests({
  releasesData = { results: releases },
  error,
  stale = false
}: { releasesData?: unknown; error?: Error; stale?: boolean } = {}) {
  (useRequest as jest.Mock).mockImplementation((request: Request) => {
    if (!request) return { data: undefined, isLoading: false, mutate };
    if (request.url.endsWith('/release/')) return { data: releasesData, isLoading: false, mutate };

    const { metric = 'complexity', release_id: releaseId = 2, repository_id: repositoryId } = request.params ?? {};
    if (repositoryId) {
      const data = distribution([withFiles(byId[repositoryId])], null, metric, releaseId);
      return { data, isLoading: false, error, mutate };
    }
    // o Service devolve a faixa de non_complex_file_density também para a complexidade
    const reference = metric === 'comment_lines_density' ? commentsReference : nonComplexReference;
    const data = distribution([action, front, service], reference, stale ? 'complexity' : metric, releaseId);
    return { data, isLoading: false, error, mutate };
  });
  (useRequests as jest.Mock).mockImplementation((requests: Request[]) => ({
    data: requests.length
      ? requests.map((request) => distribution([withFiles(byId[request?.params?.repository_id ?? 0])]))
      : undefined,
    isLoading: false,
    error: undefined,
    mutate
  }));
}

function requests() {
  return (useRequest as jest.Mock).mock.calls.map(([request]: [Request]) => request).filter(Boolean);
}

describe('useDistributionDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequests();
  });

  it('abre na release atual e na complexidade, com os repositórios da release', () => {
    const { result } = renderHook(() => useDistributionDashboard('1', '2'));

    expect(result.current.release?.id).toBe(2);
    expect(result.current.metric).toBe('complexity');
    expect(result.current.view).toBe('single');
    expect(result.current.repositories.map((item) => item.repository_name)).toEqual(['action', 'front', 'service']);
    expect(result.current.repositoryOptions).toHaveLength(3);
    expect(requests()).toContainEqual({
      url: '/v1/organizations/1/products/2/metrics-distribution/',
      method: 'get',
      params: { release_id: 2, metric: 'complexity' }
    });
  });

  it('abre no primeiro repositório com dados por arquivo e busca os arquivos dele', () => {
    const { result } = renderHook(() => useDistributionDashboard('1', '2'));

    expect(result.current.repository?.repository_name).toBe('front');
    expect(result.current.detail?.files).toHaveLength(9);
    expect(requests()).toContainEqual(
      expect.objectContaining({ params: { release_id: 2, metric: 'complexity', repository_id: 9 } })
    );
  });

  it('troca de repositório', () => {
    const { result } = renderHook(() => useDistributionDashboard('1', '2'));

    act(() => result.current.setRepositoryId(7));

    expect(result.current.repository?.repository_name).toBe('service');
    expect(result.current.detail?.repository_name).toBe('service');
  });

  it('não busca arquivos de um repositório sem dados por arquivo', () => {
    const { result } = renderHook(() => useDistributionDashboard('1', '2'));

    act(() => result.current.setRepositoryId(11));

    expect(result.current.repository?.repository_name).toBe('action');
    expect(result.current.detail).toBeUndefined();
  });

  it('na comparação, busca os arquivos de cada repositório com dados (CA6)', () => {
    const { result } = renderHook(() => useDistributionDashboard('1', '2'));

    act(() => result.current.setView('comparison'));

    const [compared] = (useRequests as jest.Mock).mock.calls.at(-1);
    expect(compared.map((request: Request) => request?.params?.repository_id)).toEqual([9, 7]);
    expect(result.current.comparison?.map((item) => item.name)).toEqual(['front', 'service']);
    expect(result.current.detail).toBeUndefined();
  });

  it('só traz a faixa de referência quando a medida usa a métrica (CA4)', () => {
    const { result } = renderHook(() => useDistributionDashboard('1', '2'));

    expect(result.current.reference).toBeNull();

    act(() => result.current.setMetric('comment_lines_density'));

    expect(result.current.reference).toEqual({ ...commentsReference, measureName: 'Densidade de arquivos comentados' });
  });

  it('troca de release', () => {
    const { result } = renderHook(() => useDistributionDashboard('1', '2'));

    act(() => result.current.setReleaseId(1));

    expect(result.current.release?.id).toBe(1);
    expect(requests()).toContainEqual(expect.objectContaining({ params: { release_id: 1, metric: 'complexity' } }));
  });

  it('mantém as opções do seletor enquanto a lista da nova métrica carrega', () => {
    const { result } = renderHook(() => useDistributionDashboard('1', '2'));

    mockRequests({ stale: true });
    act(() => result.current.setMetric('coverage'));

    expect(result.current.isLoadingRepositories).toBe(true);
    expect(result.current.repositoryOptions).toHaveLength(3);
    expect(result.current.repositories).toEqual([]);
    expect(result.current.reference).toBeNull();
    expect(result.current.detail).toBeUndefined();
    expect(useRequest).toHaveBeenCalledWith(
      expect.objectContaining({ params: { release_id: 2, metric: 'coverage' } }),
      { keepPreviousData: true }
    );
  });

  it('ao trocar de produto, volta às escolhas padrão e não mostra a lista do produto anterior', () => {
    const { result, rerender } = renderHook(({ productId }) => useDistributionDashboard('1', productId), {
      initialProps: { productId: '2' }
    });
    act(() => result.current.setMetric('coverage'));
    act(() => result.current.setView('comparison'));

    // o produto 3 não tem release, e o keepPreviousData do SWR ainda devolve a lista do produto 2
    const previous = distribution([action, front, service], null, 'coverage');
    (useRequest as jest.Mock).mockImplementation((request: Request, config?: { keepPreviousData?: boolean }) => {
      if (request?.url.endsWith('/release/')) return { data: { results: [] }, isLoading: false, mutate };
      return { data: config?.keepPreviousData ? previous : undefined, isLoading: false, mutate };
    });
    rerender({ productId: '3' });

    expect(result.current.metric).toBe('complexity');
    expect(result.current.view).toBe('single');
    expect(result.current.repositoryOptions).toEqual([]);
    expect(result.current.repository).toBeUndefined();
  });

  it('sem os ids da URL, continua carregando e não busca nada', () => {
    const { result } = renderHook(() => useDistributionDashboard('', ''));

    expect(result.current.isLoadingReleases).toBe(true);
    expect(result.current.hasReleases).toBe(false);
    expect(requests()).toEqual([]);
  });

  it('produto sem releases não tem release escolhida', () => {
    mockRequests({ releasesData: { results: [] } });

    const { result } = renderHook(() => useDistributionDashboard('1', '2'));

    expect(result.current.hasReleases).toBe(false);
    expect(result.current.release).toBeUndefined();
  });

  it('expõe os erros e tenta de novo cada busca', () => {
    mockRequests({ error: new Error('falhou') });
    const mutateReleases = jest.fn();
    const mutateRepositories = jest.fn();
    const mutateDetail = jest.fn();
    const mutateComparison = jest.fn();
    const error = new Error('falhou');
    (useRequest as jest.Mock).mockImplementation((request: Request) => {
      if (!request) return { data: undefined, isLoading: false, mutate };
      if (request.url.endsWith('/release/')) {
        return { data: { results: releases }, isLoading: false, mutate: mutateReleases };
      }
      const { metric = 'complexity', release_id: releaseId = 2, repository_id: repositoryId } = request.params ?? {};
      if (repositoryId) {
        const data = distribution([withFiles(byId[repositoryId])], null, metric, releaseId);
        return { data, isLoading: false, error, mutate: mutateDetail };
      }
      return {
        data: distribution([action, front, service], null, metric, releaseId),
        isLoading: false,
        error,
        mutate: mutateRepositories
      };
    });
    (useRequests as jest.Mock).mockImplementation(() => ({
      data: undefined,
      isLoading: false,
      error,
      mutate: mutateComparison
    }));
    const { result } = renderHook(() => useDistributionDashboard('1', '2'));

    expect(result.current.repositoriesError).toBeTruthy();
    expect(result.current.detailError).toBeTruthy();
    expect(result.current.comparisonError).toBeTruthy();

    result.current.retryReleases();
    expect(mutateReleases).toHaveBeenCalledTimes(1);
    result.current.retryRepositories();
    expect(mutateRepositories).toHaveBeenCalledTimes(1);
    result.current.retryDetail();
    expect(mutateDetail).toHaveBeenCalledTimes(1);
    result.current.retryComparison();
    expect(mutateComparison).toHaveBeenCalledTimes(1);
    expect(mutate).not.toHaveBeenCalled();
  });
});

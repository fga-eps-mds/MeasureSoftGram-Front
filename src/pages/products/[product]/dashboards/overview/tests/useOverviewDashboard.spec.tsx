import { act, renderHook } from '@testing-library/react';
import { useRequest } from '@hooks/useRequest';
import { useOverviewDashboard } from '../useOverviewDashboard';
import { analysis, characteristics, previousCharacteristics, releases, summary } from './fixtures';

jest.mock('@hooks/useRequest', () => ({ useRequest: jest.fn() }));

const mutate = jest.fn();

type Request = { url: string; params?: { release_id?: number } } | null;

function mockRequests({ releasesData = { results: releases }, error }: { releasesData?: unknown; error?: Error } = {}) {
  (useRequest as jest.Mock).mockImplementation((request: Request) => {
    if (!request) return { data: undefined, isLoading: false, mutate };
    if (request.url.endsWith('/release/')) return { data: releasesData, isLoading: false, mutate };

    const releaseId = request.params?.release_id;
    if (request.url.endsWith('/summary/')) return { data: summary(releaseId), isLoading: false, error, mutate };
    if (request.url.endsWith('/analysis_data/')) return { data: analysis(), isLoading: false, error, mutate };
    const data = releaseId === 1 ? previousCharacteristics : characteristics();
    return { data, isLoading: false, error, mutate };
  });
}

function requestedUrls() {
  return (useRequest as jest.Mock).mock.calls
    .map(([request]: [Request]) => request && `${request.url}?${request.params?.release_id ?? ''}`)
    .filter(Boolean);
}

describe('useOverviewDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequests();
  });

  it('abre na release atual e busca o resumo e as características dela', () => {
    const { result } = renderHook(() => useOverviewDashboard('1', '2'));

    expect(result.current.release?.id).toBe(2);
    expect(result.current.currentRelease?.id).toBe(2);
    expect(result.current.summary?.totals.files).toBe(1284);
    expect(result.current.characteristics?.repositories).toHaveLength(2);
    expect(requestedUrls()).toEqual(
      expect.arrayContaining([
        '/v1/organizations/1/products/2/release-dashboard/summary/?2',
        '/v1/organizations/1/products/2/release-dashboard/characteristics/?2'
      ])
    );
  });

  it('busca o analysis_data da release, para o equalizador e o radar', () => {
    const { result } = renderHook(() => useOverviewDashboard('1', '2'));

    expect(result.current.analysis?.accomplished).toHaveLength(2);
    expect(requestedUrls()).toContain('/v1/organizations/1/products/2/release/2/analysis_data/?');
  });

  it('busca também a release anterior, para a variação do TSQMI', () => {
    const { result } = renderHook(() => useOverviewDashboard('1', '2'));

    expect(result.current.previousRelease?.id).toBe(1);
    expect(result.current.previousCharacteristics).toBe(previousCharacteristics);
  });

  it('troca de release', () => {
    const { result } = renderHook(() => useOverviewDashboard('1', '2'));

    act(() => result.current.setReleaseId(1));

    expect(result.current.release?.id).toBe(1);
    expect(result.current.summary?.release.id).toBe(1);
    expect(result.current.previousRelease).toBeUndefined();
  });

  it('sem os ids da URL, continua carregando e não busca nada', () => {
    const { result } = renderHook(() => useOverviewDashboard('', ''));

    expect(result.current.isLoadingReleases).toBe(true);
    expect(result.current.hasReleases).toBe(false);
    expect(requestedUrls()).toEqual([]);
  });

  it('produto sem releases não tem release escolhida', () => {
    mockRequests({ releasesData: { results: [] } });

    const { result } = renderHook(() => useOverviewDashboard('1', '2'));

    expect(result.current.hasReleases).toBe(false);
    expect(result.current.release).toBeUndefined();
  });

  it('tenta de novo as buscas que falharam', () => {
    mockRequests({ error: new Error('falhou') });
    const { result } = renderHook(() => useOverviewDashboard('1', '2'));

    expect(result.current.summaryError).toBeTruthy();
    expect(result.current.characteristicsError).toBeTruthy();

    result.current.retrySummary();
    result.current.retryCharacteristics();
    result.current.retryReleases();
    result.current.retryAnalysis();

    expect(result.current.analysisError).toBeTruthy();
    expect(mutate).toHaveBeenCalledTimes(5);
  });
});

import { renderHook } from '@testing-library/react';
import { useRequest } from '@hooks/useRequest';
import { useReleaseEvolution } from '../useReleaseEvolution';

jest.mock('@hooks/useRequest', () => ({ useRequest: jest.fn() }));

const mutate = jest.fn();
const releases = [
  { id: 2, release_name: 'v2', start_at: '2026-02-01T00:00:00-03:00', end_at: '2026-02-28T00:00:00-03:00' },
  { id: 1, release_name: 'v1', start_at: '2026-01-01T00:00:00-03:00', end_at: '2026-01-31T00:00:00-03:00' },
];
const history = {
  results: [
    {
      key: 'total_builds',
      name: 'Total builds',
      history: [{ value: 12, created_at: '2026-02-10T10:00:00-03:00' }],
    },
  ],
};

function mockRequests({ error }: { error?: Error } = {}) {
  (useRequest as jest.Mock).mockImplementation((request: { url: string } | null) => {
    if (!request) return { data: undefined, isLoading: false, mutate };
    if (request.url.endsWith('/release/')) return { data: { results: releases }, isLoading: false, mutate };
    return { data: history, isLoading: false, error, mutate };
  });
}

describe('useReleaseEvolution', () => {
  beforeEach(() => {
    mutate.mockClear();
    mockRequests();
  });

  it('agrupa o histórico por release, da mais antiga para a mais nova', () => {
    const { result } = renderHook(() => useReleaseEvolution('1', '2', 3, 'metrics'));

    expect(result.current.releaseNames).toEqual(['v1', 'v2']);
    expect(result.current.series).toEqual([{ key: 'total_builds', name: 'Total builds', values: [null, 12] }]);
    expect(result.current.hasReleases).toBe(true);
  });

  it('pede o histórico de métricas só com o valor do repositório', () => {
    renderHook(() => useReleaseEvolution('1', '2', 3, 'metrics'));

    expect((useRequest as jest.Mock).mock.calls).toContainEqual([
      {
        url: '/v1/organizations/1/products/2/repositories/3/historical-values/metrics/',
        method: 'get',
        params: { qualifier: 'TRK' },
      },
    ]);
  });

  it('não pede histórico sem repositório escolhido', () => {
    renderHook(() => useReleaseEvolution('1', '2', undefined, 'characteristics'));

    expect((useRequest as jest.Mock).mock.calls).toContainEqual([null]);
  });

  it('expõe o erro e refaz as requisições no retry', () => {
    mockRequests({ error: new Error('falhou') });

    const { result } = renderHook(() => useReleaseEvolution('1', '2', 3, 'measures'));
    result.current.retry();

    expect(result.current.hasError).toBe(true);
    expect(mutate).toHaveBeenCalledTimes(2);
  });
});

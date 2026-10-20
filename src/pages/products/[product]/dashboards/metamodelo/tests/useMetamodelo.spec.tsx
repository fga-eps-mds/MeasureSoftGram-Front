import { act, renderHook } from '@testing-library/react';
import { useRequest } from '@hooks/useRequest';
import { useMetamodelo } from '../useMetamodelo';

jest.mock('@hooks/useRequest', () => ({ useRequest: jest.fn() }));

const releases = [
  { id: 20, release_name: 'v2.0', start_at: '2026-04-01T00:00:00-03:00', end_at: '2026-04-30T00:00:00-03:00' },
  { id: 10, release_name: 'v1.0', start_at: '2026-03-01T00:00:00-03:00', end_at: '2026-03-31T00:00:00-03:00' },
];
const tree = [{ id: null, type: 'tsqmi', key: 'tsqmi', name: 'TSQMI', description: null, weight: 100, children: [] }];
const mutate = jest.fn();

function mockRequests({ releaseData = { results: releases } as unknown, treeData = tree as unknown } = {}) {
  (useRequest as jest.Mock).mockImplementation((request: { url: string } | null) => {
    if (!request) return { data: undefined, isLoading: false, mutate };
    if (request.url.endsWith('/release/')) return { data: releaseData, isLoading: false, mutate };
    return { data: treeData, isLoading: false, mutate };
  });
}

describe('useMetamodelo', () => {
  beforeEach(() => {
    // último dia da v1.0: ela ainda é a release atual
    jest.useFakeTimers().setSystemTime(new Date('2026-03-31T10:00:00-03:00'));
    mutate.mockClear();
    mockRequests();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('abre na release atual, com a lista paginada do Service', () => {
    const { result } = renderHook(() => useMetamodelo('1', '2'));

    expect(result.current.release?.id).toBe(10);
    expect(result.current.tree?.name).toBe('TSQMI');
    expect(result.current.status).toBe('ready');
  });

  it('volta para a release atual quando a escolhida não é do produto', () => {
    const { result } = renderHook(() => useMetamodelo('1', '2'));

    act(() => result.current.setReleaseId(20));
    expect(result.current.release?.id).toBe(20);

    act(() => result.current.setReleaseId(99));
    expect(result.current.release?.id).toBe(10);
  });

  it('fica vazio sem release e não pede a árvore', () => {
    mockRequests({ releaseData: [] });

    const { result } = renderHook(() => useMetamodelo('1', '2'));

    expect(result.current.hasReleases).toBe(false);
    expect(result.current.status).toBe('empty');
    expect((useRequest as jest.Mock).mock.calls.at(-1)[0]).toBeNull();
  });

  it('refaz as duas requisições no retry', () => {
    const { result } = renderHook(() => useMetamodelo('1', '2'));

    result.current.retry();

    expect(mutate).toHaveBeenCalledTimes(2);
  });
});

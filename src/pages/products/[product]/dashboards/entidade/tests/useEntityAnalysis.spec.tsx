import { act, renderHook } from '@testing-library/react';
import { useRequest } from '@hooks/useRequest';
import { useEntityAnalysis } from '../useEntityAnalysis';

jest.mock('@hooks/useRequest', () => ({ useRequest: jest.fn() }));

const releases = [
  { id: 30, release_name: 'v3.0', start_at: '2026-05-01T00:00:00-03:00', end_at: '2026-05-31T00:00:00-03:00' },
  { id: 20, release_name: 'v2.0', start_at: '2026-04-01T00:00:00-03:00', end_at: '2026-04-30T00:00:00-03:00' },
  { id: 10, release_name: 'v1.0', start_at: '2026-03-01T00:00:00-03:00', end_at: '2026-03-31T00:00:00-03:00' },
];
const catalog = {
  characteristic: [
    { key: 'reliability', name: 'Reliability' },
    { key: 'maintainability', name: 'Maintainability' },
  ],
  subcharacteristic: [{ key: 'modifiability', name: 'Modifiability' }],
  measure: [],
  metric: [],
};
const mutate = jest.fn();

function mockRequests({ releaseData = releases as unknown, error }: { releaseData?: unknown; error?: Error } = {}) {
  (useRequest as jest.Mock).mockImplementation((request: { url: string } | null) => {
    if (!request) return { data: undefined, isLoading: false, mutate };
    if (request.url.endsWith('/release/')) return { data: releaseData, isLoading: false, mutate };
    if (request.url.endsWith('/entities/')) return { data: catalog, isLoading: false, mutate };
    return { data: { level: 'characteristic' }, isLoading: false, error, mutate };
  });
}

describe('useEntityAnalysis', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-04-15T12:00:00-03:00'));
    mutate.mockClear();
    mockRequests();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('começa pela release atual e pela primeira entidade do nível', () => {
    const { result } = renderHook(() => useEntityAnalysis('1', '2'));

    expect(result.current.releaseId).toBe(20);
    expect(result.current.currentReleaseId).toBe(20);
    expect(result.current.entityKey).toBe('reliability');
    expect((useRequest as jest.Mock).mock.calls.at(-1)[0]).toEqual({
      url: '/v1/organizations/1/products/2/entity-analysis/',
      method: 'get',
      params: { release_id: 20, level: 'characteristic', key: 'reliability' },
    });
  });

  it('aceita a lista de releases paginada', () => {
    mockRequests({ releaseData: { results: releases } });

    const { result } = renderHook(() => useEntityAnalysis('1', '2'));

    expect(result.current.releases).toHaveLength(3);
  });

  it('troca de release e volta para a atual se a escolhida não for do produto', () => {
    const { result } = renderHook(() => useEntityAnalysis('1', '2'));

    act(() => result.current.setReleaseId(10));
    expect(result.current.releaseId).toBe(10);

    act(() => result.current.setReleaseId(99));
    expect(result.current.releaseId).toBe(20);
  });

  it('troca a entidade quando o nível muda', () => {
    const { result } = renderHook(() => useEntityAnalysis('1', '2'));

    act(() => result.current.setLevel('subcharacteristic'));

    expect(result.current.entities).toEqual(catalog.subcharacteristic);
    expect(result.current.entityKey).toBe('modifiability');
  });

  it('mantém a entidade escolhida enquanto ela existe no nível', () => {
    const { result } = renderHook(() => useEntityAnalysis('1', '2'));

    act(() => result.current.setEntityKey('maintainability'));

    expect(result.current.entityKey).toBe('maintainability');
  });

  it('fica sem entidade quando o nível não tem nenhuma na configuração', () => {
    const { result } = renderHook(() => useEntityAnalysis('1', '2'));

    act(() => result.current.setLevel('measure'));

    expect(result.current.entityKey).toBeUndefined();
  });

  it('expõe o erro e refaz todas as requisições no retry', () => {
    mockRequests({ error: new Error('falhou') });

    const { result } = renderHook(() => useEntityAnalysis('1', '2'));
    result.current.retry();

    expect(result.current.error).toBeTruthy();
    expect(mutate).toHaveBeenCalledTimes(3);
  });
});

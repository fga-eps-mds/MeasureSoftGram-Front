import { renderHook } from '@testing-library/react';
import { useRequest } from '@hooks/useRequest';
import { useReleaseEvolution } from '../useReleaseEvolution';

jest.mock('@hooks/useRequest', () => ({ useRequest: jest.fn() }));

const mutate = jest.fn();
const history = {
  releases: [
    { id: 1, release_name: 'v1' },
    { id: 2, release_name: 'v2' }
  ],
  entities: [
    {
      key: 'total_builds',
      name: 'Total builds',
      history: [
        { release_id: 1, value: null },
        { release_id: 2, value: 12 }
      ]
    },
    {
      key: 'sem_dados',
      name: 'Sem dados',
      history: [
        { release_id: 1, value: null },
        { release_id: 2, value: null }
      ]
    }
  ]
};

function mockRequest({ data = history, error }: { data?: unknown; error?: Error } = {}) {
  (useRequest as jest.Mock).mockImplementation((request: unknown) =>
    request ? { data, isLoading: false, error, mutate } : { data: undefined, isLoading: false, mutate }
  );
}

describe('useReleaseEvolution', () => {
  beforeEach(() => {
    mutate.mockClear();
    (useRequest as jest.Mock).mockClear();
    mockRequest();
  });

  it('monta uma série por entidade com o valor de cada release, sem as entidades vazias', () => {
    const { result } = renderHook(() => useReleaseEvolution('1', '2', 3, 'metrics'));

    expect(result.current.releaseNames).toEqual(['v1', 'v2']);
    expect(result.current.series).toEqual([{ key: 'total_builds', name: 'Total builds', values: [null, 12] }]);
    expect(result.current.hasReleases).toBe(true);
  });

  it('pede ao Service um ponto por release do nível, numa requisição só', () => {
    renderHook(() => useReleaseEvolution('1', '2', 3, 'measures'));

    expect((useRequest as jest.Mock).mock.calls).toEqual([
      [
        {
          url: '/v1/organizations/1/products/2/repositories/3/release-history/',
          method: 'get',
          params: { level: 'measure' }
        }
      ]
    ]);
  });

  it('não pede nada sem repositório escolhido', () => {
    const { result } = renderHook(() => useReleaseEvolution('1', '2', undefined, 'characteristics'));

    expect((useRequest as jest.Mock).mock.calls).toEqual([[null]]);
    expect(result.current.hasReleases).toBe(false);
  });

  it('casa os valores pelo id da release, não pela posição', () => {
    mockRequest({
      data: {
        releases: history.releases,
        entities: [{ key: 'k', name: 'K', history: [{ release_id: 2, value: 0.5 }] }]
      }
    });

    const { result } = renderHook(() => useReleaseEvolution('1', '2', 3, 'characteristics'));

    expect(result.current.series).toEqual([{ key: 'k', name: 'K', values: [null, 0.5] }]);
  });

  it('expõe o erro e refaz a requisição no retry', () => {
    mockRequest({ error: new Error('falhou') });

    const { result } = renderHook(() => useReleaseEvolution('1', '2', 3, 'measures'));
    result.current.retry();

    expect(result.current.hasError).toBe(true);
    expect(mutate).toHaveBeenCalledTimes(1);
  });
});

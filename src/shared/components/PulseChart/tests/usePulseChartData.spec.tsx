import { act, renderHook } from '@testing-library/react';
import { useRequest } from '@hooks/useRequest';
import { productQuery } from '@services/product';
import { usePulseChartData } from '../usePulseChartData';

jest.mock('@hooks/useRequest', () => ({
  useRequest: jest.fn()
}));

jest.mock('@services/product', () => ({
  productQuery: {
    getProductRepositoriesTsqmiHistoryConfig: jest.fn(() => ({ url: 'tsqmi-history' })),
    getProductTsqmiReleaseHistoryConfig: jest.fn(() => ({ url: 'release-history' }))
  }
}));

const TSQMI_HISTORY = {
  results: [
    {
      id: 1,
      name: 'CLI',
      history: [
        { created_at: '2026-08-01T12:00:00Z', value: 0.5 },
        { created_at: '2026-08-20T12:00:00Z', value: 0.7 }
      ]
    },
    { id: 2, name: 'Front', history: [{ created_at: '2026-09-10T12:00:00Z', value: 0.9 }] },
    { id: 3, name: 'Sem histórico' }
  ]
};

const point = (releaseId: number, value: number | null, previousValue: number | null = null) => ({
  release_id: releaseId,
  value,
  created_at: value === null ? null : '2026-08-10T12:00:00Z',
  previous_value: previousValue,
  variation: value !== null && previousValue !== null ? value - previousValue : null,
  variation_percent: null
});

const RELEASE_1 = { id: 10, release_name: 'Release 1', start_at: '2026-08-01', end_at: '2026-08-15' };
const RELEASE_2 = { id: 20, release_name: 'Release 2', start_at: '2026-08-16', end_at: '2026-08-30' };

// O Front só está na Release 2, e o 'Sem histórico' não vem no histórico por release.
const RELEASE_HISTORY = {
  releases: [RELEASE_1, RELEASE_2],
  repositories: [
    { id: 1, name: 'CLI', history: [point(10, 0.5), point(20, 0.7, 0.5)] },
    { id: 2, name: 'Front', history: [point(20, null)] }
  ]
};

type RequestResult = { data?: unknown; isLoading?: boolean; error?: unknown };

const mockRequests = (tsqmi: RequestResult, releaseHistory: RequestResult) => {
  (useRequest as jest.Mock).mockImplementation((config: { url: string } | null) =>
    config?.url === 'tsqmi-history' ? tsqmi : releaseHistory
  );
};

describe('usePulseChartData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequests({ data: TSQMI_HISTORY }, { data: RELEASE_HISTORY });
  });

  it('não busca dados sem organização e produto', () => {
    mockRequests({}, {});

    const { result } = renderHook(() => usePulseChartData());

    expect(useRequest).toHaveBeenCalledWith(null);
    expect(productQuery.getProductTsqmiReleaseHistoryConfig).not.toHaveBeenCalled();
    expect(result.current.allRepositories).toEqual([]);
    expect(result.current.latestDate).toBe('');
  });

  it('monta os repositórios com medições e releases', () => {
    const { result } = renderHook(() => usePulseChartData('1', '2'));

    expect(productQuery.getProductRepositoriesTsqmiHistoryConfig).toHaveBeenCalledWith('1', '2');
    expect(productQuery.getProductTsqmiReleaseHistoryConfig).toHaveBeenCalledWith('1', '2');
    expect(result.current.allRepositories).toHaveLength(3);
    expect(result.current.allRepositories[0].releases).toEqual([
      { id: 10, name: 'Release 1', version: 'Release 1', start_at: '2026-08-01', end_at: '2026-08-15', tsqmi: point(10, 0.5) },
      {
        id: 20,
        name: 'Release 2',
        version: 'Release 2',
        start_at: '2026-08-16',
        end_at: '2026-08-30',
        tsqmi: point(20, 0.7, 0.5),
        previousName: 'Release 1'
      }
    ]);
    expect(result.current.allRepositories[2].measurements).toEqual([]);
    expect(result.current.totalMeasurements).toBe(3);
    expect(result.current.latestDate).toBe('10/09/2026');
    expect(result.current.releasesInPeriod).toBe(2);
  });

  it('cada repositório recebe só as releases que o incluem', () => {
    const { result } = renderHook(() => usePulseChartData('1', '2'));

    expect(result.current.allRepositories[1].releases.map((rel) => rel.name)).toEqual(['Release 2']);
    expect(result.current.allRepositories[1].releases[0].tsqmi?.value).toBeNull();
    expect(result.current.allRepositories[2].releases).toEqual([]);
  });

  it('ignora pontos de release que não estão na lista de releases', () => {
    mockRequests(
      { data: TSQMI_HISTORY },
      { data: { releases: [RELEASE_1], repositories: [{ id: 1, name: 'CLI', history: [point(10, 0.5), point(99, 0.6)] }] } }
    );

    const { result } = renderHook(() => usePulseChartData('1', '2'));

    expect(result.current.allRepositories[0].releases.map((rel) => rel.id)).toEqual([10]);
  });

  it('sem releases no produto, os repositórios vêm sem marcadores', () => {
    mockRequests({ data: TSQMI_HISTORY }, { data: { releases: [], repositories: [{ id: 1, name: 'CLI', history: [] }] } });

    const { result } = renderHook(() => usePulseChartData('1', '2'));

    expect(result.current.allRepositories.every((repo) => repo.releases.length === 0)).toBe(true);
    expect(result.current.releasesInPeriod).toBe(0);
  });

  it('filtra pelo repositório selecionado', () => {
    const { result } = renderHook(() => usePulseChartData('1', '2'));

    act(() => result.current.setSelectedRepo('2'));

    expect(result.current.filteredRepositories.map((repo) => repo.name)).toEqual(['Front']);
    expect(result.current.selectedMeasurements).toBe(1);
    expect(result.current.totalMeasurements).toBe(3);
    // o Front só está na Release 2
    expect(result.current.releasesInPeriod).toBe(1);
  });

  it('filtra as medições pelo período, incluindo o dia final inteiro', () => {
    const { result } = renderHook(() => usePulseChartData('1', '2'));

    act(() => {
      result.current.setStartDate('2026-08-10');
      result.current.setEndDate('2026-08-20');
    });

    expect(result.current.filteredRepositories[0].measurements).toEqual([
      { created_at: '2026-08-20T12:00:00Z', value: 0.7 }
    ]);
    expect(result.current.selectedMeasurements).toBe(1);
    // só a Release 1 encerra dentro do período (15/08); a Release 2 encerra em 30/08
    expect(result.current.filteredRepositories[0].releases.map((rel) => rel.name)).toEqual(['Release 1']);
    expect(result.current.filteredRepositories[1].releases).toEqual([]);
    expect(result.current.releasesInPeriod).toBe(1);
  });

  it('aceita período aberto em uma das pontas', () => {
    const { result } = renderHook(() => usePulseChartData('1', '2'));

    act(() => result.current.setEndDate('2026-08-01'));

    expect(result.current.selectedMeasurements).toBe(1);

    act(() => {
      result.current.setEndDate('');
      result.current.setStartDate('2026-09-01');
    });

    expect(result.current.selectedMeasurements).toBe(1);
  });

  it('expõe o erro do histórico por release', () => {
    const error = new Error('falhou');
    mockRequests({ data: TSQMI_HISTORY }, { error });

    const { result } = renderHook(() => usePulseChartData('1', '2'));

    expect(result.current.error).toBe(error);
  });

  it('expõe carregamento e erro das requisições', () => {
    const error = new Error('falhou');
    mockRequests({ isLoading: false, error }, { isLoading: true });

    const { result } = renderHook(() => usePulseChartData('1', '2'));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe(error);
    expect(result.current.allRepositories).toEqual([]);
  });
});

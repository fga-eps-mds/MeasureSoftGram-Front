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
    getReleaseList: jest.fn(() => ({ url: 'releases' }))
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

const RELEASES = [
  { release_name: 'Release 1', start_at: '2026-08-01', end_at: '2026-08-15' },
  { name: 'Release 2', version: 'v2', start_at: '2026-08-16', end_at: '2026-08-30' }
];

type RequestResult = { data?: unknown; isLoading?: boolean; error?: unknown };

const mockRequests = (tsqmi: RequestResult, releases: RequestResult) => {
  (useRequest as jest.Mock).mockImplementation((config: { url: string } | null) =>
    config?.url === 'tsqmi-history' ? tsqmi : releases
  );
};

describe('usePulseChartData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequests({ data: TSQMI_HISTORY }, { data: RELEASES });
  });

  it('não busca dados sem organização e produto', () => {
    mockRequests({}, {});

    const { result } = renderHook(() => usePulseChartData());

    expect(useRequest).toHaveBeenCalledWith(null);
    expect(productQuery.getReleaseList).not.toHaveBeenCalled();
    expect(result.current.allRepositories).toEqual([]);
    expect(result.current.latestDate).toBe('');
  });

  it('monta os repositórios com medições e releases', () => {
    const { result } = renderHook(() => usePulseChartData('1', '2'));

    expect(productQuery.getProductRepositoriesTsqmiHistoryConfig).toHaveBeenCalledWith('1', '2');
    expect(result.current.allRepositories).toHaveLength(3);
    expect(result.current.allRepositories[0].releases).toEqual([
      { name: 'Release 1', version: 'Release 1', start_at: '2026-08-01', end_at: '2026-08-15' },
      { name: 'Release 2', version: 'v2', start_at: '2026-08-16', end_at: '2026-08-30' }
    ]);
    expect(result.current.allRepositories[2].measurements).toEqual([]);
    expect(result.current.totalMeasurements).toBe(3);
    expect(result.current.latestDate).toBe('2026-09-10');
  });

  it('aceita a lista de releases paginada', () => {
    mockRequests({ data: TSQMI_HISTORY }, { data: { results: [RELEASES[0]] } });

    const { result } = renderHook(() => usePulseChartData('1', '2'));

    expect(result.current.allRepositories[0].releases).toHaveLength(1);
  });

  it('ignora releases em formato inesperado', () => {
    mockRequests({ data: TSQMI_HISTORY }, { data: { detail: 'sem releases' } });

    const { result } = renderHook(() => usePulseChartData('1', '2'));

    expect(result.current.allRepositories[0].releases).toEqual([]);
  });

  it('filtra pelo repositório selecionado', () => {
    const { result } = renderHook(() => usePulseChartData('1', '2'));

    act(() => result.current.setSelectedRepo('2'));

    expect(result.current.filteredRepositories.map((repo) => repo.name)).toEqual(['Front']);
    expect(result.current.selectedMeasurements).toBe(1);
    expect(result.current.totalMeasurements).toBe(3);
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

  it('expõe carregamento e erro das requisições', () => {
    const error = new Error('falhou');
    mockRequests({ isLoading: false, error }, { isLoading: true });

    const { result } = renderHook(() => usePulseChartData('1', '2'));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe(error);
    expect(result.current.allRepositories).toEqual([]);
  });
});

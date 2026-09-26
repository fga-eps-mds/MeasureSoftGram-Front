import { AxiosResponse } from 'axios';
import { renderHook } from '@testing-library/react';
import useSWR from 'swr';
import api from '@services/api';
import { useRequest } from '@hooks/useRequest';

jest.mock('swr');
jest.mock('@services/api', () => ({
  __esModule: true,
  default: {
    request: jest.fn()
  }
}));

const mockedUseSWR = useSWR as jest.Mock;
const mockedApiRequest = api.request as jest.Mock;

describe('useRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isValidating: false,
      mutate: jest.fn()
    });
  });

  it('deve usar a chave serializada no SWR e expor data padrão', () => {
    const request = { url: '/products', method: 'GET' };
    const response = {
      data: { id: 10, name: 'MeasureSoftGram' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    } as AxiosResponse<{ id: number; name: string }>;

    mockedUseSWR.mockReturnValue({
      data: response,
      error: undefined,
      isValidating: false,
      mutate: jest.fn()
    });

    const { result } = renderHook(() => useRequest<{ id: number; name: string }>(request));

    expect(mockedUseSWR).toHaveBeenCalledWith(
      JSON.stringify(request),
      expect.any(Function),
      expect.objectContaining({
        fallbackData: undefined
      })
    );
    expect(result.current.data).toEqual(response.data);
    expect(result.current.response).toEqual(response);
    expect(result.current.isLoading).toBe(false);
  });

  it('deve respeitar dataPath e retornar dados aninhados', () => {
    const request = { url: '/metrics', method: 'GET' };
    const response = {
      data: {
        results: {
          latestValue: 42
        }
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    } as AxiosResponse<{ results: { latestValue: number } }>;

    mockedUseSWR.mockReturnValue({
      data: response,
      error: undefined,
      isValidating: false,
      mutate: jest.fn()
    });

    const { result } = renderHook(() =>
      useRequest<{ results: { latestValue: number } }>(request, { dataPath: 'results.latestValue' })
    );

    expect(result.current.data).toBe(42);
  });

  it('deve marcar isLoading como true quando há request e ainda sem resposta', () => {
    const request = { url: '/loading', method: 'GET' };

    mockedUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isValidating: true,
      mutate: jest.fn()
    });

    const { result } = renderHook(() => useRequest(request));

    expect(result.current.isLoading).toBe(true);
  });

  it('deve marcar isLoading como false quando request for null', () => {
    const { result } = renderHook(() => useRequest(null));

    expect(mockedUseSWR).toHaveBeenCalledWith(
      null,
      expect.any(Function),
      expect.objectContaining({
        fallbackData: undefined
      })
    );
    expect(result.current.isLoading).toBe(false);
  });

  it('deve repassar fallbackData e configuração extra para o SWR', () => {
    const request = { url: '/fallback', method: 'GET' };
    const fallbackData = {
      data: { count: 7 },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    } as AxiosResponse<{ count: number }>;

    renderHook(() =>
      useRequest<{ count: number }>(request, {
        fallbackData,
        revalidateOnFocus: false
      })
    );

    expect(mockedUseSWR).toHaveBeenCalledWith(
      JSON.stringify(request),
      expect.any(Function),
      expect.objectContaining({
        fallbackData,
        revalidateOnFocus: false
      })
    );
  });

  it('deve executar o fetcher usando api.request', async () => {
    const request = { url: '/fetcher', method: 'GET' };

    mockedUseSWR.mockImplementation((_key, fetcher) => {
      fetcher();
      return {
        data: undefined,
        error: undefined,
        isValidating: true,
        mutate: jest.fn()
      };
    });

    mockedApiRequest.mockResolvedValue({
      data: { ok: true }
    });

    renderHook(() => useRequest(request));

    expect(mockedApiRequest).toHaveBeenCalledWith(request);
  });
});

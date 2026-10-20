import React, { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import api from '@services/api';
import type { GetRequest } from '@hooks/useRequest';
import { useRequests } from '@hooks/useRequests';

jest.mock('@services/api', () => ({
  __esModule: true,
  default: { request: jest.fn() }
}));

const mockedApiRequest = api.request as jest.Mock;

// cache novo a cada renderHook, sem janela de dedupe e sem retry de erro (o _app também usa shouldRetryOnError: false)
function wrapper({ children }: { children: ReactNode }) {
  return (
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0, shouldRetryOnError: false }}>
      {children}
    </SWRConfig>
  );
}

const requestA = { url: '/a/', method: 'get' };
const requestB = { url: '/b/', method: 'get' };

function respondWithUrl() {
  mockedApiRequest.mockImplementation((request: { url: string }) => Promise.resolve({ data: { url: request.url } }));
}

describe('useRequests', () => {
  beforeEach(() => {
    mockedApiRequest.mockReset();
  });

  it.each<[string, GetRequest[]]>([
    ['vazia', []],
    ['só com nulos', [null, null]]
  ])('não busca nada com a lista %s', (_name, requests) => {
    const { result } = renderHook(() => useRequests(requests), { wrapper });

    expect(mockedApiRequest).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it('busca as requisições não nulas e devolve os dados na mesma ordem', async () => {
    respondWithUrl();

    const { result } = renderHook(() => useRequests<{ url: string }>([requestA, null, requestB]), { wrapper });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.data).toEqual([{ url: '/a/' }, { url: '/b/' }]));
    expect(result.current.isLoading).toBe(false);
    expect(mockedApiRequest).toHaveBeenNthCalledWith(1, requestA);
    expect(mockedApiRequest).toHaveBeenNthCalledWith(2, requestB);
  });

  it('dispara todas as requisições sem esperar a anterior responder', async () => {
    mockedApiRequest.mockReturnValue(new Promise(jest.fn()));

    const { result } = renderHook(() => useRequests([requestA, requestB]), { wrapper });

    await waitFor(() => expect(mockedApiRequest).toHaveBeenCalledTimes(2));
    expect(result.current.isLoading).toBe(true);
  });

  it('expõe o erro quando qualquer uma das requisições falha', async () => {
    const failure = new Error('falhou');
    mockedApiRequest.mockResolvedValueOnce({ data: { url: '/a/' } }).mockRejectedValueOnce(failure);

    const { result } = renderHook(() => useRequests([requestA, requestB]), { wrapper });

    await waitFor(() => expect(result.current.error).toBe(failure));
    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('refaz todas as requisições no mutate', async () => {
    respondWithUrl();
    const { result } = renderHook(() => useRequests([requestA, requestB]), { wrapper });
    await waitFor(() => expect(result.current.data).toHaveLength(2));

    await act(async () => {
      await result.current.mutate();
    });

    expect(mockedApiRequest).toHaveBeenCalledTimes(4);
  });

  it('não busca de novo quando recebe uma lista nova com o mesmo conteúdo', async () => {
    respondWithUrl();
    const { result, rerender } = renderHook(() => useRequests([{ ...requestA }, { ...requestB }]), { wrapper });
    await waitFor(() => expect(result.current.data).toHaveLength(2));

    rerender();

    expect(mockedApiRequest).toHaveBeenCalledTimes(2);
  });

  it('busca o conjunto todo de novo quando a lista muda', async () => {
    respondWithUrl();
    const { result, rerender } = renderHook(({ requests }) => useRequests<{ url: string }>(requests), {
      wrapper,
      initialProps: { requests: [requestA] }
    });
    await waitFor(() => expect(result.current.data).toEqual([{ url: '/a/' }]));

    rerender({ requests: [requestA, requestB] });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.data).toEqual([{ url: '/a/' }, { url: '/b/' }]));
    expect(mockedApiRequest).toHaveBeenCalledTimes(3);
  });
});

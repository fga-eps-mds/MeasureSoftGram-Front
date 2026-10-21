import { act, renderHook, waitFor } from '@testing-library/react';
import api from '@services/api';
import { refreshRepositoryList, useRepositoryList } from '../useRepositoryList';

jest.mock('@services/api', () => ({ __esModule: true, default: { request: jest.fn() } }));

const mockRequest = api.request as jest.Mock;

describe('useRepositoryList', () => {
  beforeEach(() => {
    mockRequest.mockReset();
  });

  it('pede a lista do produto uma vez só, mesmo com vários componentes usando o hook', async () => {
    mockRequest.mockResolvedValue({ data: { results: [{ id: 1, name: 'api' }] } });

    const { result } = renderHook(() => [useRepositoryList('1', '10'), useRepositoryList('1', '10')]);

    await waitFor(() => expect(result.current[0].repositories).toEqual([{ id: 1, name: 'api' }]));
    expect(result.current[1].repositories).toEqual([{ id: 1, name: 'api' }]);
    expect(mockRequest).toHaveBeenCalledTimes(1);
    expect(mockRequest).toHaveBeenCalledWith({ url: '/v1/organizations/1/products/10/repositories/', method: 'get' });
  });

  it('não pede nada sem os ids da rota', () => {
    const { result } = renderHook(() => useRepositoryList('', ''));

    expect(result.current.repositories).toBeUndefined();
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it('busca a lista de novo depois de uma mudança nos repositórios', async () => {
    mockRequest.mockResolvedValueOnce({ data: { results: [] } });
    const { result } = renderHook(() => useRepositoryList('1', '11'));
    await waitFor(() => expect(result.current.repositories).toEqual([]));

    mockRequest.mockResolvedValueOnce({ data: { results: [{ id: 2, name: 'novo' }] } });
    await act(() => refreshRepositoryList('1', '11'));

    expect(result.current.repositories).toEqual([{ id: 2, name: 'novo' }]);
  });
});

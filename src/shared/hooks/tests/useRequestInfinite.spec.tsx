import { renderHook, act } from '@testing-library/react';
import { AxiosResponse } from 'axios';
import useSWRInfinite from 'swr/infinite';

import { useRequestInfinite } from '../useRequestInfinite';

// Mock the API service
jest.mock('@services/api', () => jest.fn());

// Mock SWR Infinite
jest.mock('swr/infinite', () => jest.fn());

const mockApi = require('@services/api');

const mockUseSWRInfinite = useSWRInfinite as jest.MockedFunction<typeof useSWRInfinite>;

describe('useRequestInfinite', () => {
  const mockGetRequest = jest.fn();
  const defaultConfig = { limit: 10 };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isLoadingInitialData', () => {
    it('should be true when no response and no error', () => {
      mockUseSWRInfinite.mockReturnValue({
        data: undefined,
        error: undefined,
        isValidating: false,
        mutate: jest.fn(),
        size: 0,
        setSize: jest.fn(),
      });

      const { result } = renderHook(() =>
        useRequestInfinite(mockGetRequest, defaultConfig)
      );

      expect(result.current.isLoadingInitialData).toBe(true);
    });

    it('should be false when response is available', () => {
      const mockResponse: AxiosResponse[] = [
        { data: { items: [1, 2, 3] }, status: 200, statusText: 'OK', headers: {}, config: {} },
      ];

      mockUseSWRInfinite.mockReturnValue({
        data: mockResponse,
        error: undefined,
        isValidating: false,
        mutate: jest.fn(),
        size: 1,
        setSize: jest.fn(),
      });

      const { result } = renderHook(() =>
        useRequestInfinite(mockGetRequest, defaultConfig)
      );

      expect(result.current.isLoadingInitialData).toBe(false);
    });

    it('should be false when error occurs', () => {
      mockUseSWRInfinite.mockReturnValue({
        data: undefined,
        error: new Error('Test error'),
        isValidating: false,
        mutate: jest.fn(),
        size: 0,
        setSize: jest.fn(),
      });

      const { result } = renderHook(() =>
        useRequestInfinite(mockGetRequest, defaultConfig)
      );

      expect(result.current.isLoadingInitialData).toBe(false);
    });
  });

  describe('isLoadingMore', () => {
    it('should be true when loading initial data', () => {
      mockUseSWRInfinite.mockReturnValue({
        data: undefined,
        error: undefined,
        isValidating: false,
        mutate: jest.fn(),
        size: 0,
        setSize: jest.fn(),
      });

      const { result } = renderHook(() =>
        useRequestInfinite(mockGetRequest, defaultConfig)
      );

      expect(result.current.isLoadingMore).toBe(true);
    });

    it('should be true when size > response length', () => {
      const mockResponse: AxiosResponse[] = [
        { data: { items: [1, 2, 3] }, status: 200, statusText: 'OK', headers: {}, config: {} },
      ];

      mockUseSWRInfinite.mockReturnValue({
        data: mockResponse,
        error: undefined,
        isValidating: false,
        mutate: jest.fn(),
        size: 2,
        setSize: jest.fn(),
      });

      const { result } = renderHook(() =>
        useRequestInfinite(mockGetRequest, defaultConfig)
      );

      expect(result.current.isLoadingMore).toBe(true);
    });

    it('should be false when all data is loaded', () => {
      const mockResponse: AxiosResponse[] = [
        { data: { items: [1, 2, 3] }, status: 200, statusText: 'OK', headers: {}, config: {} },
        { data: { items: [4, 5, 6] }, status: 200, statusText: 'OK', headers: {}, config: {} },
      ];

      mockUseSWRInfinite.mockReturnValue({
        data: mockResponse,
        error: undefined,
        isValidating: false,
        mutate: jest.fn(),
        size: 2,
        setSize: jest.fn(),
      });

      const { result } = renderHook(() =>
        useRequestInfinite(mockGetRequest, defaultConfig)
      );

      expect(result.current.isLoadingMore).toBe(false);
    });
  });

  describe('isRefreshing', () => {
    it('should be true when validating and response length equals size', () => {
      const mockResponse: AxiosResponse[] = [
        { data: { items: [1, 2, 3] }, status: 200, statusText: 'OK', headers: {}, config: {} },
      ];

      mockUseSWRInfinite.mockReturnValue({
        data: mockResponse,
        error: undefined,
        isValidating: true,
        mutate: jest.fn(),
        size: 1,
        setSize: jest.fn(),
      });

      const { result } = renderHook(() =>
        useRequestInfinite(mockGetRequest, defaultConfig)
      );

      expect(result.current.isRefreshing).toBe(true);
    });

    it('should be false when not validating', () => {
      const mockResponse: AxiosResponse[] = [
        { data: { items: [1, 2, 3] }, status: 200, statusText: 'OK', headers: {}, config: {} },
      ];

      mockUseSWRInfinite.mockReturnValue({
        data: mockResponse,
        error: undefined,
        isValidating: false,
        mutate: jest.fn(),
        size: 1,
        setSize: jest.fn(),
      });

      const { result } = renderHook(() =>
        useRequestInfinite(mockGetRequest, defaultConfig)
      );

      expect(result.current.isRefreshing).toBe(false);
    });
  });

  describe('isEmpty', () => {
    it('should be true when first page has empty data', () => {
      const mockResponse: AxiosResponse[] = [
        { data: { items: [] }, status: 200, statusText: 'OK', headers: {}, config: {} },
      ];

      mockUseSWRInfinite.mockReturnValue({
        data: mockResponse,
        error: undefined,
        isValidating: false,
        mutate: jest.fn(),
        size: 1,
        setSize: jest.fn(),
      });

      const { result } = renderHook(() =>
        useRequestInfinite(mockGetRequest, { ...defaultConfig, dataPath: 'items' })
      );

      expect(result.current.isEmpty).toBe(true);
    });

    it('should be false when first page has data', () => {
      const mockResponse: AxiosResponse[] = [
        { data: { items: [1, 2, 3] }, status: 200, statusText: 'OK', headers: {}, config: {} },
      ];

      mockUseSWRInfinite.mockReturnValue({
        data: mockResponse,
        error: undefined,
        isValidating: false,
        mutate: jest.fn(),
        size: 1,
        setSize: jest.fn(),
      });

      const { result } = renderHook(() =>
        useRequestInfinite(mockGetRequest, { ...defaultConfig, dataPath: 'items' })
      );

      expect(result.current.isEmpty).toBe(false);
    });

    it('should be true when no response', () => {
      mockUseSWRInfinite.mockReturnValue({
        data: undefined,
        error: undefined,
        isValidating: false,
        mutate: jest.fn(),
        size: 0,
        setSize: jest.fn(),
      });

      const { result } = renderHook(() =>
        useRequestInfinite(mockGetRequest, defaultConfig)
      );

      expect(result.current.isEmpty).toBe(true);
    });
  });

  describe('isReachingEnd', () => {
    it('should be true when isEmpty is true', () => {
      const mockResponse: AxiosResponse[] = [
        { data: { items: [] }, status: 200, statusText: 'OK', headers: {}, config: {} },
      ];

      mockUseSWRInfinite.mockReturnValue({
        data: mockResponse,
        error: undefined,
        isValidating: false,
        mutate: jest.fn(),
        size: 1,
        setSize: jest.fn(),
      });

      const { result } = renderHook(() =>
        useRequestInfinite(mockGetRequest, { ...defaultConfig, dataPath: 'items' })
      );

      expect(result.current.isReachingEnd).toBe(true);
    });

    it('should be true when last page has less than limit', () => {
      const mockResponse: AxiosResponse[] = [
        { data: { items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, status: 200, statusText: 'OK', headers: {}, config: {} },
        { data: { items: [11, 12] }, status: 200, statusText: 'OK', headers: {}, config: {} },
      ];

      mockUseSWRInfinite.mockReturnValue({
        data: mockResponse,
        error: undefined,
        isValidating: false,
        mutate: jest.fn(),
        size: 2,
        setSize: jest.fn(),
      });

      const { result } = renderHook(() =>
        useRequestInfinite(mockGetRequest, { ...defaultConfig, dataPath: 'items' })
      );

      expect(result.current.isReachingEnd).toBe(true);
    });

    it('should be false when last page has exactly limit', () => {
      const mockResponse: AxiosResponse[] = [
        { data: { items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, status: 200, statusText: 'OK', headers: {}, config: {} },
        { data: { items: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20] }, status: 200, statusText: 'OK', headers: {}, config: {} },
      ];

      mockUseSWRInfinite.mockReturnValue({
        data: mockResponse,
        error: undefined,
        isValidating: false,
        mutate: jest.fn(),
        size: 2,
        setSize: jest.fn(),
      });

      const { result } = renderHook(() =>
        useRequestInfinite(mockGetRequest, { ...defaultConfig, dataPath: 'items' })
      );

      expect(result.current.isReachingEnd).toBe(false);
    });
  });

  describe('fetchMore', () => {
    it('should call setSize when not loading and not at end', () => {
      const mockSetSize = jest.fn();
      const mockResponse: AxiosResponse[] = [
        { data: { items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, status: 200, statusText: 'OK', headers: {}, config: {} },
      ];

      mockUseSWRInfinite.mockReturnValue({
        data: mockResponse,
        error: undefined,
        isValidating: false,
        mutate: jest.fn(),
        size: 1,
        setSize: mockSetSize,
      });

      const { result } = renderHook(() =>
        useRequestInfinite(mockGetRequest, defaultConfig)
      );

      act(() => {
        result.current.fetchMore();
      });

      expect(mockSetSize).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should return null when loading more', () => {
      const mockResponse: AxiosResponse[] = [
        { data: { items: [1, 2, 3] }, status: 200, statusText: 'OK', headers: {}, config: {} },
      ];

      mockUseSWRInfinite.mockReturnValue({
        data: mockResponse,
        error: undefined,
        isValidating: false,
        mutate: jest.fn(),
        size: 2,
        setSize: jest.fn(),
      });

      const { result } = renderHook(() =>
        useRequestInfinite(mockGetRequest, defaultConfig)
      );

      const fetchResult = result.current.fetchMore();
      expect(fetchResult).toBe(null);
    });

    it('should return null when refreshing', () => {
      const mockResponse: AxiosResponse[] = [
        { data: { items: [1, 2, 3] }, status: 200, statusText: 'OK', headers: {}, config: {} },
      ];

      mockUseSWRInfinite.mockReturnValue({
        data: mockResponse,
        error: undefined,
        isValidating: true,
        mutate: jest.fn(),
        size: 1,
        setSize: jest.fn(),
      });

      const { result } = renderHook(() =>
        useRequestInfinite(mockGetRequest, defaultConfig)
      );

      const fetchResult = result.current.fetchMore();
      expect(fetchResult).toBe(null);
    });

    it('should return null when reaching end', () => {
      const mockResponse: AxiosResponse[] = [
        { data: { items: [1, 2] }, status: 200, statusText: 'OK', headers: {}, config: {} },
      ];

      mockUseSWRInfinite.mockReturnValue({
        data: mockResponse,
        error: undefined,
        isValidating: false,
        mutate: jest.fn(),
        size: 1,
        setSize: jest.fn(),
      });

      const { result } = renderHook(() =>
        useRequestInfinite(mockGetRequest, { ...defaultConfig, dataPath: 'items' })
      );

      const fetchResult = result.current.fetchMore();
      expect(fetchResult).toBe(null);
    });
  });

  describe('data and response', () => {
    it('should return mapped data from responses', () => {
      const mockResponse: AxiosResponse[] = [
        { data: { items: [1, 2, 3] }, status: 200, statusText: 'OK', headers: {}, config: {} },
        { data: { items: [4, 5, 6] }, status: 200, statusText: 'OK', headers: {}, config: {} },
      ];

      mockUseSWRInfinite.mockReturnValue({
        data: mockResponse,
        error: undefined,
        isValidating: false,
        mutate: jest.fn(),
        size: 2,
        setSize: jest.fn(),
      });

      const { result } = renderHook(() =>
        useRequestInfinite(mockGetRequest, defaultConfig)
      );

      expect(result.current.data).toEqual([{ items: [1, 2, 3] }, { items: [4, 5, 6] }]);
      expect(result.current.response).toEqual(mockResponse);
    });

    it('should return undefined data when no response', () => {
      mockUseSWRInfinite.mockReturnValue({
        data: undefined,
        error: undefined,
        isValidating: false,
        mutate: jest.fn(),
        size: 0,
        setSize: jest.fn(),
      });

      const { result } = renderHook(() =>
        useRequestInfinite(mockGetRequest, defaultConfig)
      );

      expect(result.current.data).toBeUndefined();
      expect(result.current.response).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('should return error from SWR', () => {
      const mockError = new Error('Test error');

      mockUseSWRInfinite.mockReturnValue({
        data: undefined,
        error: mockError,
        isValidating: false,
        mutate: jest.fn(),
        size: 0,
        setSize: jest.fn(),
      });

      const { result } = renderHook(() =>
        useRequestInfinite(mockGetRequest, defaultConfig)
      );

      expect(result.current.error).toBe(mockError);
    });
  });

  describe('mutate, size, setSize, isValidating', () => {
    it('should pass through SWR values', () => {
      const mockMutate = jest.fn();
      const mockSetSize = jest.fn();

      mockUseSWRInfinite.mockReturnValue({
        data: [],
        error: undefined,
        isValidating: true,
        mutate: mockMutate,
        size: 1,
        setSize: mockSetSize,
      });

      const { result } = renderHook(() =>
        useRequestInfinite(mockGetRequest, defaultConfig)
      );

      expect(result.current.mutate).toBe(mockMutate);
      expect(result.current.size).toBe(1);
      expect(result.current.setSize).toBe(mockSetSize);
      expect(result.current.isValidating).toBe(true);
    });
  });
});

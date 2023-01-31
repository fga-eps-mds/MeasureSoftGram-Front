import { useCallback, useMemo } from 'react';
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import get from 'lodash/get';
import useSWRInfinite, { SWRInfiniteConfiguration, SWRInfiniteResponse } from 'swr/infinite';

import api from '@services/api';

export type GetRequest = AxiosRequestConfig | null;

interface InfiniteReturn<Data, Error>
  extends Pick<
    SWRInfiniteResponse<AxiosResponse<Data>, AxiosError<Error>>,
    'isValidating' | 'error' | 'mutate' | 'size' | 'setSize'
  > {
  data: Data[] | undefined;
  response: AxiosResponse<Data>[] | undefined;
  isLoadingInitialData: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;
  fetchMore(): Promise<AxiosResponse<Data>[] | undefined> | null;
  isEmpty: boolean;
  isReachingEnd: boolean;
}

export interface InfiniteConfig<Data = unknown, Error = unknown>
  extends SWRInfiniteConfiguration<AxiosResponse<Data>, AxiosError<Error>> {
  dataPath?: keyof Data | string | string[];
  limit: number;
}

export function useRequestInfinite<Data = unknown, Error = unknown>(
  getRequest: (index: number, previousPageData: AxiosResponse<Data> | null) => GetRequest,
  { dataPath, limit = 10, ...config }: InfiniteConfig<Data, Error> = {} as InfiniteConfig<Data, Error>
): InfiniteReturn<Data, Error> {
  const {
    data: response,
    error,
    isValidating,
    mutate,
    size,
    setSize
  } = useSWRInfinite<AxiosResponse<Data>, AxiosError<Error>>(
    (index, previousPageData) => {
      const key = getRequest(index, previousPageData);

      return key ? JSON.stringify({ ...key, params: { ...key?.params, limit } }) : null;
    },
    (request: string) => api(JSON.parse(request)),
    {
      ...config
    }
  );

  const path = dataPath ? `data.${String(dataPath)}` : 'data';

  const isEmpty = useMemo(() => !response || get(response, `[0].${path}`)?.length === 0, [path, response]);

  const isLoadingInitialData = useMemo(() => !response && !error, [error, response]);

  const isLoadingMore = useMemo(
    () => isLoadingInitialData || Boolean(size > 0 && response && typeof response[size - 1] === 'undefined'),
    [isLoadingInitialData, response, size]
  );

  const isRefreshing = useMemo(
    () => Boolean(isValidating && response && response.length === size),
    [isValidating, response, size]
  );

  const isReachingEnd = useMemo(
    () => isEmpty || Boolean(response && get(response, `[${response?.length - 1}].${path}`)?.length < limit),
    [isEmpty, limit, path, response]
  );

  const fetchMore = useCallback(() => {
    if (isLoadingMore || isRefreshing || isReachingEnd) return null;

    return setSize((currentSize) => currentSize + 1);
  }, [isLoadingMore, isRefreshing, isReachingEnd, setSize]);

  return {
    data: response?.length ? response.map((r) => r.data) : undefined,
    response,
    error,
    isLoadingInitialData,
    isLoadingMore,
    isRefreshing,
    isValidating,
    isEmpty,
    isReachingEnd,
    mutate,
    size,
    setSize,
    fetchMore
  };
}

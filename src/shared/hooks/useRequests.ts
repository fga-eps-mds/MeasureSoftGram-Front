import { AxiosError, AxiosRequestConfig } from 'axios';
import useSWR, { KeyedMutator } from 'swr';
import api from '@services/api';
import type { GetRequest } from '@hooks/useRequest';

export interface RequestsReturn<Data, Error> {
  /** Um item por requisição não nula, na ordem em que vieram. */
  data: Data[] | undefined;
  isLoading: boolean;
  error: AxiosError<Error> | undefined;
  mutate: KeyedMutator<Data[]>;
}

function isRequest(request: GetRequest): request is AxiosRequestConfig {
  return Boolean(request);
}

/**
 * Várias requisições em paralelo (ex.: uma por repositório) sob uma única chave do SWR. Sem requisições não busca
 * nada; se qualquer uma falhar, o conjunto todo falha.
 */
export function useRequests<Data = unknown, Error = unknown>(requests: GetRequest[]): RequestsReturn<Data, Error> {
  const validRequests = requests.filter(isRequest);
  const hasRequests = validRequests.length > 0;

  const { data, error, mutate } = useSWR<Data[], AxiosError<Error>>(
    hasRequests ? JSON.stringify(validRequests) : null,
    // o fetcher lê as requisições da própria chave, então só depende dela
    (key: string) =>
      Promise.all(
        (JSON.parse(key) as AxiosRequestConfig[]).map((request) =>
          api.request<Data>(request).then((response) => response.data)
        )
      )
  );

  return {
    data,
    isLoading: !data && !error && hasRequests,
    error,
    mutate
  };
}

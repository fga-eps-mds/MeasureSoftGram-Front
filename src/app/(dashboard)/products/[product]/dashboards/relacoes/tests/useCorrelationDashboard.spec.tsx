import { act, renderHook } from '@testing-library/react';
import { useRequest } from '@hooks/useRequest';
import { CorrelationLevel } from '@customTypes/product';
import { useCorrelationDashboard } from '../useCorrelationDashboard';
import { correlation, repositories } from './fixtures';

jest.mock('@hooks/useRequest', () => ({ useRequest: jest.fn() }));

type Params = { repository_id?: number; level?: CorrelationLevel };
type Request = { url: string; params?: Params } | null;
type Response = { data?: unknown; isLoading?: boolean; error?: Error };

const mutate = jest.fn();

function respondWithCorrelation(params: Params): Response {
  return { data: correlation({ repositoryId: params.repository_id, level: params.level }) };
}

interface Scenario {
  repositoryList?: Response;
  /** Resposta do correlation para os parâmetros pedidos. */
  answer?: typeof respondWithCorrelation;
}

/** Responde como o Service, pela URL do pedido. */
function mockRequests({
  repositoryList = { data: { results: repositories } },
  answer = respondWithCorrelation
}: Scenario = {}) {
  (useRequest as jest.Mock).mockImplementation((request: Request) => {
    const respond = (response: Response) => ({ isLoading: false, mutate, ...response });
    if (!request) return respond({});
    const { url, params = {} } = request;
    if (url.endsWith('/repositories/')) return respond(repositoryList);
    return respond(answer(params));
  });
}

function correlationRequests() {
  return (useRequest as jest.Mock).mock.calls
    .filter(([request]: [Request]) => request?.url.includes('/correlation/'))
    .map(([request, config]: [Request, unknown]) => ({ params: request?.params, config }));
}

function lastCorrelationParams() {
  const calls = correlationRequests();
  return calls[calls.length - 1]?.params;
}

describe('useCorrelationDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequests();
  });

  it('abre no primeiro repositório do produto e no nível característica', () => {
    const { result } = renderHook(() => useCorrelationDashboard('1', '2'));

    expect(result.current.repository?.id).toBe(10);
    expect(result.current.level).toBe('characteristic');
    expect(lastCorrelationParams()).toEqual({ repository_id: 10, level: 'characteristic' });
    expect(correlationRequests()[0].config).toEqual({ keepPreviousData: true });
    expect(result.current.status).toBe('ready');
  });

  it('pede a correlação do repositório e do nível escolhidos', () => {
    const { result } = renderHook(() => useCorrelationDashboard('1', '2'));

    act(() => result.current.setRepositoryId(11));
    act(() => result.current.setLevel('subcharacteristic'));

    expect(lastCorrelationParams()).toEqual({ repository_id: 11, level: 'subcharacteristic' });
    expect(result.current.correlation?.repository.id).toBe(11);
  });

  it('marca como atualizando enquanto a resposta ainda é a da seleção anterior', () => {
    mockRequests({ answer: () => ({ data: correlation({ repositoryId: 10 }) }) });
    const { result } = renderHook(() => useCorrelationDashboard('1', '2'));
    expect(result.current.isUpdating).toBe(false);

    act(() => result.current.setRepositoryId(11));

    expect(result.current.isUpdating).toBe(true);
    expect(result.current.correlation?.repository.id).toBe(10);
  });

  it('ignora a resposta guardada de um repositório de outro produto', () => {
    mockRequests({ answer: () => ({ data: correlation({ repository: { id: 99, name: 'Outro' } }) }) });

    const { result } = renderHook(() => useCorrelationDashboard('1', '2'));

    expect(result.current.correlation).toBeUndefined();
    expect(result.current.status).toBe('loading');
  });

  it('produto sem repositório', () => {
    mockRequests({ repositoryList: { data: { results: [] } } });

    const { result } = renderHook(() => useCorrelationDashboard('1', '2'));

    expect(result.current.status).toBe('noRepository');
    expect(correlationRequests().every(({ params }) => params === undefined)).toBe(true);
  });

  it.each<[string, Parameters<typeof correlation>[0], string]>([
    ['produto sem release', { releases: [], excluded_releases: 0, reason: 'insufficient_entities' }, 'noRelease'],
    ['configuração com menos de 2 entidades', { entities: [], reason: 'insufficient_entities' }, 'noEntities'],
    ['repositório sem análise', { releases: [], excluded_releases: 3, reason: 'insufficient_releases' }, 'noAnalyses']
  ])('%s', (_name, fields, status) => {
    mockRequests({ answer: () => ({ data: correlation(fields) }) });

    const { result } = renderHook(() => useCorrelationDashboard('1', '2'));

    expect(result.current.status).toBe(status);
  });

  it('com 1 ou 2 releases com valor, avisa que faltam releases', () => {
    const [first, second] = correlation().releases;
    mockRequests({
      answer: () => ({ data: correlation({ releases: [first, second], reason: 'insufficient_releases', pairs: [] }) })
    });

    const { result } = renderHook(() => useCorrelationDashboard('1', '2'));

    expect(result.current.status).toBe('fewReleases');
  });

  it('enquanto a lista de repositórios carrega', () => {
    mockRequests({ repositoryList: { isLoading: true } });

    const { result } = renderHook(() => useCorrelationDashboard('1', '2'));

    expect(result.current.status).toBe('loading');
  });

  it('com falha, mostra o erro e tenta os dois pedidos de novo', () => {
    mockRequests({ answer: () => ({ error: new Error('500') }) });
    const { result } = renderHook(() => useCorrelationDashboard('1', '2'));
    expect(result.current.status).toBe('error');

    act(() => result.current.retry());

    expect(mutate).toHaveBeenCalledTimes(2);
  });

  it('volta às escolhas padrão quando o produto da URL muda', () => {
    const { result, rerender } = renderHook(({ productId }) => useCorrelationDashboard('1', productId), {
      initialProps: { productId: '2' }
    });
    act(() => result.current.setRepositoryId(11));
    act(() => result.current.setLevel('subcharacteristic'));

    rerender({ productId: '3' });

    expect(result.current.repository?.id).toBe(10);
    expect(result.current.level).toBe('characteristic');
  });
});

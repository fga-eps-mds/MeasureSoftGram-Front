import { act, renderHook } from '@testing-library/react';
import { useRequest } from '@hooks/useRequest';
import { DistributionLevel, ReleaseDashboardRepository } from '@customTypes/product';
import { useDistributionDashboard } from '../useDistributionDashboard';
import { action, catalog, distribution, entity, front, releaseRepositories, releases, service, tree } from './fixtures';

jest.mock('@hooks/useRequest', () => ({ useRequest: jest.fn() }));

type Params = { release_id?: number; repository_id?: number; level?: DistributionLevel; key?: string };
type Request = { url: string; params?: Params } | null;
type Response = { data?: unknown; isLoading?: boolean; error?: Error };

const mutate = jest.fn();

function respondWithDistribution(params: Params): Response {
  return {
    data: distribution({
      releaseId: params.release_id,
      repositoryId: params.repository_id,
      level: params.level,
      key: params.key ?? 'tsqmi'
    })
  };
}

interface Scenario {
  releasesData?: unknown;
  repositories?: ReleaseDashboardRepository[];
  metrics?: typeof catalog;
  /** Resposta do analysis-distribution para os parâmetros pedidos. */
  answer?: typeof respondWithDistribution;
  /** Resposta fixa (como a do keepPreviousData), em vez de uma por parâmetro. */
  stale?: Response;
}

/** Responde como o Service, pela URL do pedido. */
function mockRequests({
  releasesData = { results: releases },
  repositories = [action, service, front],
  metrics = catalog,
  answer = respondWithDistribution,
  stale
}: Scenario = {}) {
  (useRequest as jest.Mock).mockImplementation((request: Request) => {
    const respond = (response: Response) => ({ isLoading: false, mutate, ...response });
    if (!request) return respond(stale ?? {});
    const { url, params = {} } = request;
    if (url.endsWith('/release/')) return respond({ data: releasesData });
    if (url.includes('release-dashboard/characteristics')) {
      return respond({ data: releaseRepositories(repositories, params.release_id) });
    }
    if (url.includes('quality-model-tree')) return respond({ data: tree });
    if (url.includes('entity-analysis/entities')) return respond({ data: metrics });
    return respond(stale ?? answer(params));
  });
}

function distributionRequests() {
  return (useRequest as jest.Mock).mock.calls
    .filter(([request]: [Request]) => request?.url.includes('analysis-distribution'))
    .map(([request, config]: [Request, unknown]) => ({ params: request?.params, config }));
}

function lastDistributionParams() {
  const calls = distributionRequests();
  return calls[calls.length - 1]?.params;
}

describe('useDistributionDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequests();
  });

  it('abre na release atual, no TSQMI e no primeiro repositório da release com análise', () => {
    const { result } = renderHook(() => useDistributionDashboard('1', '2'));

    expect(result.current.release?.id).toBe(2);
    expect(result.current.level).toBe('tsqmi');
    expect(result.current.repositories.map((item) => item.id)).toEqual([11, 7, 9]);
    // o Action vem antes, mas não tem análise na release
    expect(result.current.repository?.id).toBe(7);
    expect(result.current.selectors).toEqual([]);
    expect(lastDistributionParams()).toEqual({ release_id: 2, repository_id: 7, level: 'tsqmi', key: undefined });
  });

  it('sem nenhum repositório com análise, abre no primeiro da lista', () => {
    mockRequests({ repositories: [action, { ...front, tsqmi: { value: null, created_at: null } }] });
    const { result } = renderHook(() => useDistributionDashboard('1', '2'));

    expect(result.current.repository?.id).toBe(11);
  });

  it('expõe a entidade, os filhos e o período da resposta, para os outros quadros da página', () => {
    const { result } = renderHook(() => useDistributionDashboard('1', '2'));

    expect(result.current.status).toBe('ready');
    expect(result.current.entity?.key).toBe('tsqmi');
    expect(result.current.children?.map((child) => child.key)).toEqual(['reliability']);
    expect(result.current.period).toEqual({
      count: 6,
      first: '2026-08-17T10:00:00-03:00',
      last: '2026-08-22T10:00:00-03:00'
    });
    expect(result.current.distribution?.repository).toEqual({ id: 7, name: 'MeasureSoftGram-Service' });
  });

  it('mantém a resposta anterior ao trocar a seleção, sem piscar', () => {
    const { result } = renderHook(() => useDistributionDashboard('1', '2'));

    act(() => result.current.setRepositoryId(9));

    expect(lastDistributionParams()).toMatchObject({ repository_id: 9 });
    distributionRequests().forEach(({ config }) => expect(config).toEqual({ keepPreviousData: true }));
  });

  it('marca como atualizando enquanto a resposta ainda é a da seleção anterior', () => {
    mockRequests({ stale: { data: distribution({ repositoryId: 7 }) } });
    const { result } = renderHook(() => useDistributionDashboard('1', '2'));

    act(() => result.current.setRepositoryId(9));

    expect(result.current.status).toBe('ready');
    expect(result.current.isUpdating).toBe(true);
    expect(result.current.entity?.key).toBe('tsqmi');
  });

  it('abaixo do TSQMI, pede a entidade em vigor no último seletor', () => {
    const { result } = renderHook(() => useDistributionDashboard('1', '2'));

    act(() => result.current.setLevel('subcharacteristic'));

    expect(result.current.selectors.map((selector) => [selector.level, selector.value])).toEqual([
      ['characteristic', 'reliability'],
      ['subcharacteristic', 'testing_status']
    ]);
    expect(result.current.selectedEntity).toEqual({ key: 'testing_status', name: 'Testing Status' });
    expect(lastDistributionParams()).toEqual({
      release_id: 2,
      repository_id: 7,
      level: 'subcharacteristic',
      key: 'testing_status'
    });
  });

  it('no nível métrica, só oferece as métricas com valor por análise e limpa os níveis de baixo', () => {
    const { result } = renderHook(() => useDistributionDashboard('1', '2'));

    act(() => result.current.setLevel('metric'));
    expect(result.current.selectors.map((selector) => selector.options.map((option) => option.key))).toEqual([
      ['reliability', 'functional_suitability'],
      ['testing_status'],
      ['ci_feedback_time'],
      ['sum_ci_feedback_times', 'total_builds']
    ]);

    act(() => result.current.setEntity('metric', 'total_builds'));
    expect(lastDistributionParams()).toMatchObject({ level: 'metric', key: 'total_builds' });

    act(() => result.current.setEntity('characteristic', 'functional_suitability'));
    expect(result.current.selectors.map((selector) => selector.value)).toEqual([
      'functional_suitability',
      'functional_completeness',
      'team_throughput',
      'resolved_issues'
    ]);
    expect(lastDistributionParams()).toMatchObject({ level: 'metric', key: 'resolved_issues' });
  });

  it('sem métricas com valor por análise, avisa que o nível não tem entidade e não pede nada', () => {
    mockRequests({ metrics: { ...catalog, metric: [] } });
    const { result } = renderHook(() => useDistributionDashboard('1', '2'));

    act(() => result.current.setLevel('metric'));

    expect(result.current.status).toBe('noEntities');
    expect(lastDistributionParams()).toMatchObject({ level: 'tsqmi' });
  });

  it('produto sem release', () => {
    mockRequests({ releasesData: { results: [] } });
    const { result } = renderHook(() => useDistributionDashboard('1', '2'));

    expect(result.current.status).toBe('noRelease');
  });

  it('release sem repositório', () => {
    mockRequests({ repositories: [] });
    const { result } = renderHook(() => useDistributionDashboard('1', '2'));

    expect(result.current.status).toBe('noRepository');
    expect(distributionRequests()).toEqual([]);
  });

  it('repositório sem análise na release', () => {
    mockRequests({ answer: () => ({ data: distribution({ main: entity('tsqmi', 'TSQMI', 'tsqmi', []) }) }) });
    const { result } = renderHook(() => useDistributionDashboard('1', '2'));

    expect(result.current.status).toBe('noAnalyses');
  });

  it('com falha, mostra o erro e tenta todos os pedidos de novo', () => {
    mockRequests({ answer: () => ({ error: new Error('400') }) });
    const { result } = renderHook(() => useDistributionDashboard('1', '2'));

    expect(result.current.status).toBe('error');
    act(() => result.current.retry());
    expect(mutate).toHaveBeenCalledTimes(5);
  });

  it('ignora a resposta guardada de uma release de outro produto', () => {
    mockRequests({ stale: { data: distribution({ releaseId: 99 }) } });
    const { result } = renderHook(() => useDistributionDashboard('1', '2'));

    expect(result.current.distribution).toBeUndefined();
    expect(result.current.status).toBe('loading');
  });

  it('volta às escolhas padrão quando o produto da URL muda', () => {
    const { result, rerender } = renderHook(({ productId }) => useDistributionDashboard('1', productId), {
      initialProps: { productId: '2' }
    });

    act(() => {
      result.current.setRepositoryId(9);
      result.current.setLevel('measure');
    });
    rerender({ productId: '3' });

    expect(result.current.level).toBe('tsqmi');
    expect(result.current.repository?.id).toBe(7);
  });
});

import { useMemo, useState } from 'react';
import { useRequest } from '@hooks/useRequest';
import { useRepositoryList } from '@hooks/useRepositoryList';
import { productQuery } from '@services/product';
import { QualityModelNode } from '@customTypes/metamodel';
import { Repository } from '@customTypes/repository';
import {
  HistoricalValuesResponse,
  MultiSelection,
  TimeGranularity,
  TimeSeries,
  resolveSelection,
  toTimeSeries
} from '@utils/historicalValues';

export type EvolutionLevel = 'characteristics' | 'subcharacteristics' | 'measures' | 'metrics';

export interface FilterOption {
  key: string;
  name: string;
}

export interface EvolutionChartData {
  series: TimeSeries[];
  isLoading: boolean;
  hasError: boolean;
  retry: () => void;
}

const NO_REPOSITORIES: Repository[] = [];
const NO_NODES: QualityModelNode[] = [];
// só o valor do repositório inteiro, sem os valores por arquivo: a mesma regra da Análise por Entidade (US21.02)
const REPOSITORY_LEVEL_METRICS = { qualifier: 'TRK' };

function childrenOf(nodes: QualityModelNode[], keys: string[]) {
  return nodes.filter((node) => keys.includes(node.key)).flatMap((node) => node.children);
}

function toOptions(nodes: QualityModelNode[]): FilterOption[] {
  const unique = new Map(nodes.map((node) => [node.key, { key: node.key, name: node.name }]));
  return [...unique.values()];
}

function pick(options: FilterOption[], keys: string[]) {
  return options.filter((option) => keys.includes(option.key));
}

/**
 * Dados da Evolução Temporal: os filtros em cascata da hierarquia do modelo de qualidade do produto (característica,
 * subcaracterísticas, medidas e métricas) e os históricos do repositório escolhido, como no dashboard do Grafana.
 */
export function useTemporalEvolution(organizationId: string, productId: string) {
  const { repositories = NO_REPOSITORIES, isLoading: isLoadingRepositories } = useRepositoryList(
    organizationId,
    productId
  );
  const [chosenRepositoryId, setRepositoryId] = useState<number | undefined>();
  // decidido no render: os históricos já saem com o primeiro repositório, sem esperar um efeito
  const repositoryId = repositories.some((repository) => repository.id === chosenRepositoryId)
    ? chosenRepositoryId
    : repositories[0]?.id;

  const [granularity, setGranularity] = useState<TimeGranularity>('day');
  const [chosenCharacteristic, setCharacteristic] = useState<string | undefined>();
  const [subcharacteristicSelection, setSubcharacteristics] = useState<MultiSelection>('all');
  const [measureSelection, setMeasures] = useState<MultiSelection>('all');
  const [metricSelection, setMetrics] = useState<MultiSelection>('all');

  const treeRequest = useRequest<QualityModelNode[]>(
    productQuery.getCurrentQualityModelTreeConfig(organizationId, productId)
  );
  const histories = {
    characteristics: useRequest<HistoricalValuesResponse>(
      productQuery.getRepositoryHistoricalValuesConfig(organizationId, productId, repositoryId, 'characteristics')
    ),
    subcharacteristics: useRequest<HistoricalValuesResponse>(
      productQuery.getRepositoryHistoricalValuesConfig(organizationId, productId, repositoryId, 'subcharacteristics')
    ),
    measures: useRequest<HistoricalValuesResponse>(
      productQuery.getRepositoryHistoricalValuesConfig(organizationId, productId, repositoryId, 'measures')
    ),
    metrics: useRequest<HistoricalValuesResponse>(
      productQuery.getRepositoryHistoricalValuesConfig(
        organizationId,
        productId,
        repositoryId,
        'metrics',
        REPOSITORY_LEVEL_METRICS
      )
    )
  };

  const characteristicNodes = treeRequest.data?.[0]?.children ?? NO_NODES;
  const characteristicOptions = toOptions(characteristicNodes);
  const characteristic = characteristicOptions.some((option) => option.key === chosenCharacteristic)
    ? chosenCharacteristic
    : characteristicOptions[0]?.key;

  // cada nível só oferece as filhas do que foi escolhido no nível anterior
  const subcharacteristicNodes = childrenOf(characteristicNodes, characteristic ? [characteristic] : []);
  const subcharacteristicOptions = toOptions(subcharacteristicNodes);
  const subcharacteristics = resolveSelection(subcharacteristicSelection, subcharacteristicOptions);

  const measureNodes = childrenOf(subcharacteristicNodes, subcharacteristics);
  const measureOptions = toOptions(measureNodes);
  const measures = resolveSelection(measureSelection, measureOptions);

  // métricas sem valor do repositório inteiro (só por arquivo) ficam de fora, como na Análise por Entidade
  const repositoryMetricKeys = useMemo(
    () =>
      new Set(
        (histories.metrics.data?.results ?? []).filter((item) => item.history.length > 0).map((item) => item.key)
      ),
    [histories.metrics.data]
  );
  const metricOptions = toOptions(childrenOf(measureNodes, measures)).filter((option) =>
    repositoryMetricKeys.has(option.key)
  );
  const metrics = resolveSelection(metricSelection, metricOptions);

  const entitiesByLevel: Record<EvolutionLevel, FilterOption[]> = {
    characteristics: pick(characteristicOptions, characteristic ? [characteristic] : []),
    subcharacteristics: pick(subcharacteristicOptions, subcharacteristics),
    measures: pick(measureOptions, measures),
    metrics: pick(metricOptions, metrics)
  };

  const charts = (Object.keys(histories) as EvolutionLevel[]).reduce((result, level) => {
    const request = histories[level];
    result[level] = {
      series: toTimeSeries(request.data?.results, entitiesByLevel[level], granularity),
      isLoading: treeRequest.isLoading || request.isLoading,
      hasError: !!treeRequest.error || !!request.error,
      retry: () => {
        if (treeRequest.error) void treeRequest.mutate();
        void request.mutate();
      }
    };
    return result;
  }, {} as Record<EvolutionLevel, EvolutionChartData>);

  const isAll = (selection: MultiSelection, options: FilterOption[]) =>
    selection === 'all' || !selection.some((key) => options.some((option) => option.key === key));

  return {
    repositories,
    isLoadingRepositories,
    repositoryId,
    setRepositoryId,
    granularity,
    setGranularity,
    characteristic,
    characteristicOptions,
    setCharacteristic,
    subcharacteristics: isAll(subcharacteristicSelection, subcharacteristicOptions) ? 'all' : subcharacteristics,
    subcharacteristicOptions,
    setSubcharacteristics,
    measures: isAll(measureSelection, measureOptions) ? 'all' : measures,
    measureOptions,
    setMeasures,
    metrics: isAll(metricSelection, metricOptions) ? 'all' : metrics,
    metricOptions,
    setMetrics,
    charts
  } as const;
}

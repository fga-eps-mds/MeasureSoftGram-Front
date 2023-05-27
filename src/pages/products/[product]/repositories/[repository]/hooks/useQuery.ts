import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { useRepositoryContext } from '@contexts/RepositoryProvider';

import { repository } from '@services/repository';
import { productQuery } from '@services/product';

import formatEntitiesFilter from '@utils/formatEntitiesFilter';
import formatEntitiesMetrics from '@utils/formatEntitiesMetrics';
import { getPathId } from '@utils/pathDestructer';
import { Historical } from '@customTypes/repository';
import { LatestValues, CompareGoalAccomplished } from '@customTypes/product';

import { LARGE_PRIME_NUMBER } from './const';

export const useQuery = () => {
  const { setCurrentRepository, setCharacteristics, setSubCharacteristics, setMeasures, setMetrics, setHistoricalSQC } =
    useRepositoryContext();

  const [repositoryHistoricalCharacteristics, setRepositoryHistoricalCharacteristics] = useState<Historical[]>([]);
  const [latestValueCharacteristics, setLatestValueCharacteristics] = useState<LatestValues[]>([]);
  const [comparedGoalAccomplished, setcomparedGoalAccomplished] = useState<CompareGoalAccomplished[]>([]);
  const [checkedOptionsFormat, setCheckedOptions] = useState({});

  const { query } = useRouter();

  function formatCheckedOptions(
    characteristics: string[],
    subCharacteristics: string[],
    measures: string[],
    metrics: string[]
  ) {
    let map = {};
    const updateMap = (option: string) => {
      map = {
        ...map,
        [option]: true
      };
    };

    characteristics.forEach((option) => updateMap(option));
    subCharacteristics.forEach((option) => updateMap(option));
    measures.forEach((option) => updateMap(option));
    metrics.forEach((option) => updateMap(option));

    return map;
  }

  async function loadRepositorySupportedEntities(organizationId: string, productId: string, repositoryId: string) {
    try {
      const result = await productQuery.getPreConfigEntitiesRelationship(organizationId, productId);
      const [characteristics, subCharacteristics, measures] = formatEntitiesFilter(result.data);

      const resultMetrics = await productQuery.getMetricsLatestValues(organizationId, productId, repositoryId);
      const [metrics] = formatEntitiesMetrics(resultMetrics.data);

      setCharacteristics(characteristics);
      setSubCharacteristics(subCharacteristics);
      setMeasures(measures);
      setMetrics(metrics);
      setCheckedOptions(formatCheckedOptions(characteristics, subCharacteristics, measures, metrics));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }

  async function loadHistoricalCharacteristics(organizationId: string, productId: string, repositoryId: string) {
    try {
      const result = await repository.getHistorical({
        organizationId,
        productId,
        repositoryId,
        entity: 'characteristics'
      });

      setRepositoryHistoricalCharacteristics(result.data.results);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }

  async function loadLatestValueCharacteristics(organizationId: string, productId: string, repositoryId: string) {
    try {
      const result = await productQuery.getCharacteristicsLatestValues(organizationId, productId, repositoryId);

      setLatestValueCharacteristics(result.data);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }

  async function loadHistoricalSqc(organizationId: string, productId: string, repositoryId: string) {
    try {
      const { crypto } = window;
      const array = new Uint32Array(1);
      const randomValue = crypto.getRandomValues(array)[0];
      const id = Math.round(randomValue * LARGE_PRIME_NUMBER);
      const {
        data: { results }
      } = await repository.getHistorical({
        organizationId,
        productId,
        repositoryId,
        entity: 'sqc'
      });

      setHistoricalSQC({ id, key: 'SQC', name: 'SQC', history: results });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }

  async function loadRepository(organizationId: string, productId: string, repositoryId: string) {
    try {
      const { data } = await repository.getRepository(organizationId, productId, repositoryId);

      setCurrentRepository(data);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }

  async function loadRepositoryInfo(organizationId: string, productId: string, repositoryId: string) {
    try {
      await Promise.all([
        loadRepository(organizationId, productId, repositoryId),
        loadHistoricalSqc(organizationId, productId, repositoryId),
        loadRepositorySupportedEntities(organizationId, productId, repositoryId),
        loadHistoricalCharacteristics(organizationId, productId, repositoryId),
        loadLatestValueCharacteristics(organizationId, productId, repositoryId)
      ]).then();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }

  async function loadCompareGoalAccomplished(organizationId: string, productId: string, repositoryId: string) {
    try {
      const result = await productQuery.getCompareGoalAccomplished(organizationId, productId, repositoryId);
      return result?.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }

  useEffect(() => {
    if (query?.repository) {
      const [organizationId, productId] = getPathId(query?.product as string);
      const [repositoryId] = getPathId(query?.repository as string);

      loadRepositoryInfo(organizationId, productId, repositoryId);
      loadCompareGoalAccomplished(organizationId, productId, repositoryId).then((data) => {
        setcomparedGoalAccomplished(data);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query?.repository]);

  return {
    repositoryHistoricalCharacteristics,
    checkedOptionsFormat,
    comparedGoalAccomplished,
    latestValueCharacteristics
  };
};

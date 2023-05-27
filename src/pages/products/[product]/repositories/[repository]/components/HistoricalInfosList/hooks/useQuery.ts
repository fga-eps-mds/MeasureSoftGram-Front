import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { useProductContext } from '@contexts/ProductProvider';

import { productQuery } from '@services/product';
import { repository } from '@services/repository';

import { getPathId } from '@utils/pathDestructer';
import { Historical } from '@customTypes/repository';
import { LatestValues } from '@customTypes/product';

export const useQuery = () => {
  const { currentProduct } = useProductContext();

  const [repositoryHistoricalSubCharacteristics, setRepositoryHistoricalSubCharacteristics] = useState<Historical[]>(
    []
  );
  const [repositoryHistoricalMeasures, setRepositoryHistoricalMeasures] = useState<Historical[]>([]);
  const [repositoryHistoricalMetrics, setRepositoryHistoricalMetrics] = useState<Historical[]>([]);

  const [latestValueSubcharacteristics, setLatestValueSubcharacteristics] = useState<LatestValues[]>([]);
  const [latestValueMeasures, setLatestValueMeasures] = useState<LatestValues[]>([]);
  const [latestValueMetrics, setLatestValueMetrics] = useState<LatestValues[]>([]);

  const { query } = useRouter();

  async function loadHistoricalSubCharacteristics(organizationId: string, productId: string, repositoryId: string) {
    try {
      const result = await repository.getHistorical({
        organizationId,
        productId,
        repositoryId,
        entity: 'subcharacteristics'
      });

      setRepositoryHistoricalSubCharacteristics(result.data.results);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }

  async function loadHistoricalMeasures(organizationId: string, productId: string, repositoryId: string) {
    try {
      const result = await repository.getHistorical({
        organizationId,
        productId,
        repositoryId,
        entity: 'measures'
      });

      setRepositoryHistoricalMeasures(result.data.results);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }

  async function loadHistoricalMetrics(organizationId: string, productId: string, repositoryId: string) {
    try {
      const result = await repository.getHistorical({
        organizationId,
        productId,
        repositoryId,
        entity: 'metrics'
      });

      setRepositoryHistoricalMetrics(result.data.results);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }

  async function loadLatestValueSubcharacteristics(organizationId: string, productId: string, repositoryId: string) {
    try {
      const result = await productQuery.getSubcharacteristicsLatestValues(organizationId, productId, repositoryId);

      setLatestValueSubcharacteristics(result.data);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }

  async function loadLatestValueMeasures(organizationId: string, productId: string, repositoryId: string) {
    try {
      const result = await productQuery.getMeasuresLatestValues(organizationId, productId, repositoryId);

      setLatestValueMeasures(result.data);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }

  async function loadLatestValueMetrics(organizationId: string, productId: string, repositoryId: string) {
    try {
      const result = await productQuery.getMetricsLatestValues(organizationId, productId, repositoryId);

      setLatestValueMetrics(result.data);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }

  useEffect(() => {
    if (query?.repository && currentProduct) {
      const [organizationId, productId] = getPathId(query?.product as string);
      const [repositoryId] = getPathId(query?.repository as string);

      loadHistoricalSubCharacteristics(organizationId, productId, repositoryId);
      loadHistoricalMeasures(organizationId, productId, repositoryId);
      loadHistoricalMetrics(organizationId, productId, repositoryId);
      loadLatestValueSubcharacteristics(organizationId, productId, repositoryId);
      loadLatestValueMeasures(organizationId, productId, repositoryId);
      loadLatestValueMetrics(organizationId, productId, repositoryId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query?.repository, currentProduct]);

  return {
    repositoryHistoricalSubCharacteristics,
    repositoryHistoricalMeasures,
    repositoryHistoricalMetrics,
    latestValueSubcharacteristics,
    latestValueMeasures,
    latestValueMetrics
  };
};

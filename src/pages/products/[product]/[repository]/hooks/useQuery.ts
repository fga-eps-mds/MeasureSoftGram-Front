import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { useRepositoryContext } from '@contexts/RepositoryProvider';

import { repository } from '@services/repository';
import { productQuery } from '@services/product';

import formatEntitiesFilter from '@utils/formatEntitiesFilter';
import { getPathId } from '@utils/pathDestructer';
import { Historical } from '@customTypes/repository';

import { LARGE_PRIME_NUMBER } from './const';

export const useQuery = () => {
  const { setCurrentRepository, setCharacteristics, setSubCharacteristics, setHistoricalSQC } = useRepositoryContext();

  const [repositoryHistoricalCharacteristics, setRepositoryHistoricalCharacteristics] = useState<Historical[]>([]);
  const [checkedOptionsFormat, setCheckedOptions] = useState({});

  const { query } = useRouter();

  function formatCheckedOptions(characteristics: string[], subCharacteristics: string[]) {
    let map = {};
    const updateMap = (option: string) => {
      map = {
        ...map,
        [option]: true
      };
    };

    characteristics.forEach((option) => updateMap(option));
    subCharacteristics.forEach((option) => updateMap(option));

    return map;
  }

  async function loadRepositorySupportedEntities(organizationId: string, productId: string) {
    try {
      const result = await productQuery.getPreConfigEntitiesRelationship(organizationId, productId);
      const [characteristics, subCharacteristics] = formatEntitiesFilter(result.data);

      setCharacteristics(characteristics);
      setSubCharacteristics(subCharacteristics);
      setCheckedOptions(formatCheckedOptions(characteristics, subCharacteristics));
    } catch (error) {
      console.error(error);
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
      console.error(error);
    }
  }

  async function loadHistoricalSqc(organizationId: string, productId: string, repositoryId: string) {
    try {
      const id = Math.round(Math.random() * LARGE_PRIME_NUMBER);
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
      console.error(error);
    }
  }

  async function loadRepository(organizationId: string, productId: string, repositoryId: string) {
    try {
      const { data } = await repository.getRepository(organizationId, productId, repositoryId);

      setCurrentRepository(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadRepositoryInfo(organizationId: string, productId: string, repositoryId: string) {
    try {
      await Promise.all([
        loadRepository(organizationId, productId, repositoryId),
        loadHistoricalSqc(organizationId, productId, repositoryId),
        loadRepositorySupportedEntities(organizationId, productId),
        loadHistoricalCharacteristics(organizationId, productId, repositoryId)
      ]).then();
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (query?.repository) {
      const [organizationId, productId] = getPathId(query?.product as string);
      const [repositoryId] = getPathId(query?.repository as string);

      loadRepositoryInfo(organizationId, productId, repositoryId);
    }
  }, [query?.repository]);

  return { repositoryHistoricalCharacteristics, checkedOptionsFormat };
};

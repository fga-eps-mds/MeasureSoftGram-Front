import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { useRepositoryContext } from '@contexts/RepositoryProvider';
import { useProductContext } from '@contexts/ProductProvider';

import { supportedEntitiesQuery } from '@services/supportedEntities';
import { repository } from '@services/repository';

import formatEntitiesFilter from '@utils/formatEntitiesFilter';
import { getPathId } from '@utils/pathDestructer';
import { Historical } from '@customTypes/respository';

import { LARGE_PRIME_NUMBER } from './const';

export const useQuery = () => {
  const { setCurrentRepository, setCharacteristics, setSubCharacteristics } = useRepositoryContext();
  const { currentProduct } = useProductContext();

  const [repositoryHistoricalCharacteristics, setRepositoryHistoricalCharacteristics] = useState<Historical[]>([]);
  const [repositoryHistoricalSqc, setRepositoryHistoricalSqc] = useState<Historical>();
  const [checkedOptionsFormat, setCheckedOptions] = useState({});

  const { query } = useRouter();

  function formatCheckedOptions(characteristics: string[], subCharacteristics: string[]) {
    let map = {};
    const updateMap = (option: string) => {
      map = {
        ...map,
        [option]: false
      };
    };

    characteristics.forEach((option) => updateMap(option));
    subCharacteristics.forEach((option) => updateMap(option));

    return map;
  }

  async function loadRepositorySupportedEntities() {
    try {
      const result = await supportedEntitiesQuery.getSupportedEntities('1', currentProduct?.id);
      const [characteristics, subCharacteristics] = formatEntitiesFilter(result.data.data.characteristics);

      setCharacteristics(characteristics);
      setSubCharacteristics(subCharacteristics);
      setCheckedOptions(formatCheckedOptions(characteristics, subCharacteristics));
    } catch (error) {
      console.error(error);
    }
  }

  async function loadHistoricalCharacteristicsAndSub(repositoryId: number) {
    try {
      const obj = {
        organizationId: 1,
        productId: currentProduct?.id || 3,
        repositoryId,
        entity: 'characteristics'
      };
      const result = await repository.getHistoricalCharacteristics(obj);

      setRepositoryHistoricalCharacteristics(result.data.results);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadHistoricalSqc(repositoryId: number) {
    try {
      const id = Math.round(Math.random() * LARGE_PRIME_NUMBER);
      const {
        data: { results }
      } = await repository.getSqcHistory('1', currentProduct?.id || 3, repositoryId);

      setRepositoryHistoricalSqc({ id, key: 'SQC', name: 'SQC', history: results });
    } catch (error) {
      console.error(error);
    }
  }

  async function loadRepository(repositoryId: number) {
    try {
      const { data } = await repository.getRepository('1', currentProduct?.id || 3, repositoryId);

      setCurrentRepository({ id: data.id, url: data.url, history: undefined, name: data.name });
    } catch (error) {
      console.error(error);
    }
  }

  async function loadRepositoryInfo(repositoryId: number) {
    try {
      await Promise.all([
        loadRepository(repositoryId),
        loadHistoricalSqc(repositoryId),
        loadRepositorySupportedEntities(),
        loadHistoricalCharacteristicsAndSub(repositoryId)
      ]).then();
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (query?.repository && currentProduct) {
      const repositoryId = Number(getPathId(query?.repository as string));

      loadRepositoryInfo(repositoryId);
    }
  }, [query?.repository, currentProduct]);

  return { repositoryHistoricalCharacteristics, repositoryHistoricalSqc, checkedOptionsFormat };
};

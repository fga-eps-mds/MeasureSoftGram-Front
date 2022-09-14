import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import { useRepositoryContext } from '@contexts/RepositoryProvider';
import { supportedEntitiesQuery } from '@services/supportedEntities';
import { useProductContext } from '@contexts/ProductProvider';
import formatEntitiesFilter from '@utils/formatEntitiesFilter';
import { repository } from '@services/repository';

interface SqcHistory {
  id: number;
  value: number;
  created_at: Date;
}

interface Historical {
  id: number;
  key: string;
  name: string;
  history: Array<SqcHistory>;
}

const LARGE_PRIME_NUMBER = 907111937;

export const useQuery = () => {
  const { setCurrentRepository, setCharacteristics, setSubCharacteristics, currentRepository } = useRepositoryContext();
  const { currentProduct } = useProductContext();

  const [repositoryHistoricalCharacteristics, setRepositoryHistoricalCharacteristics] = useState<
    Array<Historical | undefined>
  >([]);
  const [repositoryHistoricalSqc, setRepositoryHistoricalSqc] = useState<Historical>();

  const [checkedOptionsFormat, setCheckedOptions] = useState({});

  const { query } = useRouter();

  function getPathId(name: string) {
    const nameArray = name.split('-');
    return nameArray[0];
  }

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

  async function loadRepositorySupportedEntities(repositoryId: number) {
    try {
      const result = await supportedEntitiesQuery.getSupportedEntities(currentProduct?.id, repositoryId);
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
      } = await repository.getSqcHistory(1, currentProduct?.id || 3, repositoryId);

      setRepositoryHistoricalSqc({ id, key: 'SQC', name: 'SQC', history: results });
    } catch (error) {
      console.error(error);
    }
  }

  async function loadRepository(repositoryId: number) {
    try {
      const { data } = await repository.getRepository(1, currentProduct?.id || 3, repositoryId);

      setCurrentRepository({ id: data.id, url: data.url, history: undefined, name: data.name });
    } catch (error) {
      console.error(error);
    }
  }

  async function loadRepositoryInfo(repositoryId: number) {
    try {
      await Promise.all([
        loadRepository(repositoryId),
        loadRepositorySupportedEntities(repositoryId),
        loadHistoricalCharacteristicsAndSub(repositoryId),
        loadHistoricalSqc(repositoryId)
      ]).then();
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (query?.repository) {
      const repositoryId = Number(getPathId(query?.repository as string));

      loadRepositoryInfo(repositoryId);
      // setRepositoryHistoricalCharacteristics([...repositoryHistoricalCharacteristics, repositoryHistoricalSqc]);
    }
  }, [query?.repository]);

  return { repositoryHistoricalCharacteristics, repositoryHistoricalSqc, checkedOptionsFormat };
};

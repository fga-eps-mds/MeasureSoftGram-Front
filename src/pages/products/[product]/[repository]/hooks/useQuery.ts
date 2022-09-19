import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { useRepositoryContext } from '@contexts/RepositoryProvider';
import { useProductContext } from '@contexts/ProductProvider';

import { repository } from '@services/repository';
import { productQuery } from '@services/product';

import formatEntitiesFilter from '@utils/formatEntitiesFilter';
import { getPathId } from '@utils/pathDestructer';
import { Historical } from '@customTypes/repository';

import { LARGE_PRIME_NUMBER } from './const';

export const useQuery = () => {
  const { setCurrentRepository, setCharacteristics, setSubCharacteristics, setHistoricalSQC } = useRepositoryContext();
  const { currentProduct } = useProductContext();
  const { currentOrganization } = useOrganizationContext();

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

  async function loadRepositorySupportedEntities() {
    try {
      if (currentProduct) {
        const result = await productQuery.getPreConfigEntitiesRelationship(currentOrganization.id, currentProduct.id);
        const [characteristics, subCharacteristics] = formatEntitiesFilter(result.data);

        setCharacteristics(characteristics);
        setSubCharacteristics(subCharacteristics);
        setCheckedOptions(formatCheckedOptions(characteristics, subCharacteristics));
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function loadHistoricalCharacteristics(repositoryId: string) {
    try {
      const result = await repository.getHistorical({
        organizationId: currentOrganization.id,
        productId: currentProduct?.id,
        repositoryId,
        entity: 'characteristics'
      });

      setRepositoryHistoricalCharacteristics(result.data.results);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadHistoricalSqc(repositoryId: string) {
    try {
      const id = Math.round(Math.random() * LARGE_PRIME_NUMBER);
      const {
        data: { results }
      } = await repository.getHistorical({
        organizationId: currentOrganization.id,
        productId: currentProduct?.id,
        repositoryId,
        entity: 'sqc'
      });

      setHistoricalSQC({ id, key: 'SQC', name: 'SQC', history: results });
    } catch (error) {
      console.error(error);
    }
  }

  async function loadRepository(repositoryId: string) {
    try {
      const { data } = await repository.getRepository(
        currentOrganization.id,
        currentProduct?.id || currentOrganization.id,
        repositoryId
      );

      setCurrentRepository(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadRepositoryInfo(repositoryId: string) {
    try {
      await Promise.all([
        loadRepository(repositoryId),
        loadHistoricalSqc(repositoryId),
        loadRepositorySupportedEntities(),
        loadHistoricalCharacteristics(repositoryId)
      ]).then();
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (query?.repository && currentProduct) {
      const [repositoryId] = getPathId(query?.repository as string);

      loadRepositoryInfo(repositoryId);
    }
  }, [query?.repository, currentProduct]);

  return { repositoryHistoricalCharacteristics, checkedOptionsFormat };
};

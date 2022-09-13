import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import { useRepositoryContext } from '@contexts/RepositoryProvider';
import { supportedEntitiesQuery } from '@services/supportedEntities';
import { useProductContext } from '@contexts/ProductProvider';
import formatEntitiesFilter from '@utils/formatEntitiesFilter';

// import { RepositoriesSqcHistory } from '@customTypes/product';
// import { productQuery } from '@services/product';

export const useQuery = () => {
  const { setCurrentRepository, setCharacteristics, setSubCharacteristics } = useRepositoryContext();
  const { currentProduct } = useProductContext();
  // const [repositoriesSqcHistory, setRepositoriesSqcHistory] = useState<RepositoriesSqcHistory>();

  const { query } = useRouter();

  function getPathId(name: string) {
    const nameArray = name.split('-');
    return nameArray[0];
  }

  async function loadRepositorySupportedEntities(repositoryId: number) {
    try {
      const result = await supportedEntitiesQuery.getSupportedEntities(currentProduct?.id, repositoryId);
      console.log(result.data.data.characteristics);
      const [characteristics, subCharacteristics] = formatEntitiesFilter(result.data.data.characteristics);
      setCharacteristics(characteristics);
      setSubCharacteristics(subCharacteristics);
    } catch (error) {
      console.error(error);
    }
  }

  // async function loadRepositoriesSqcHistory(productId: string) {
  //   try {
  //     const result = await productQuery.getProductRepositoriesSqcHistory('1', productId as string);
  //     setRepositoriesSqcHistory(result.data);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

  useEffect(() => {
    if (query?.repository) {
      const repositoryId = Number(getPathId(query?.repository as string));

      loadRepositorySupportedEntities(repositoryId);
      // loadRepositoriesSqcHistory(productId);
      console.log(repositoryId);
      setCurrentRepository({ id: repositoryId, url: undefined, history: undefined, name: undefined });
    }
  }, [query?.repository]);

  return {};
};

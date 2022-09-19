import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { useProductContext } from '@contexts/ProductProvider';

import { repository } from '@services/repository';

import { getPathId } from '@utils/pathDestructer';
import { Historical } from '@customTypes/repository';

export const useQuery = () => {
  const { currentProduct } = useProductContext();

  const [repositoryHistoricalSubCharacteristics, setRepositoryHistoricalSubCharacteristics] = useState<Historical[]>(
    []
  );

  const { query } = useRouter();

  async function loadHistoricalSubCharacteristics(repositoryId: string) {
    try {
      const result = await repository.getHistorical({
        organizationId: '1',
        productId: currentProduct?.id,
        repositoryId,
        entity: 'subcharacteristics'
      });

      setRepositoryHistoricalSubCharacteristics(result.data.results);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (query?.repository && currentProduct) {
      const repositoryId = getPathId(query?.repository as string);

      loadHistoricalSubCharacteristics(repositoryId);
    }
  }, [query?.repository, currentProduct]);

  return { repositoryHistoricalSubCharacteristics };
};

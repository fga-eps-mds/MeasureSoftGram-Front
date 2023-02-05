import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { useProductContext } from '@contexts/ProductProvider';

import { repository } from '@services/repository';

import { getPathId } from '@utils/pathDestructer';
import { Historical } from '@customTypes/repository';
import { toast } from 'react-toastify';

export const useQuery = () => {
  const { currentProduct } = useProductContext();

  const [repositoryHistoricalSubCharacteristics, setRepositoryHistoricalSubCharacteristics] = useState<Historical[]>(
    []
  );

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
      toast.error(`${error}`);
    }
  }

  useEffect(() => {
    if (query?.repository && currentProduct) {
      const [organizationId, productId] = getPathId(query?.product as string);
      const [repositoryId] = getPathId(query?.repository as string);

      loadHistoricalSubCharacteristics(organizationId, productId, repositoryId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query?.repository, currentProduct]);

  return { repositoryHistoricalSubCharacteristics };
};

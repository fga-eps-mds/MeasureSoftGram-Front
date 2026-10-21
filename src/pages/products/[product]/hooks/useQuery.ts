import { useEffect } from 'react';

import { useRouter } from 'next/router';

import { productQuery } from '@services/product';

import { useProductContext } from '@contexts/ProductProvider';
import { useRepositoryContext } from '@contexts/RepositoryProvider';

import { getPathId } from '@utils/pathDestructer';
import { useRequest } from '@hooks/useRequest';
import { useRepositoryList } from '@hooks/useRepositoryList';
import { RepositoriesLatestTsqmi } from '@customTypes/product';

// como a lista de repositórios: o valor guardado aparece na hora ao voltar para a página e é conferido em seguida
const REVALIDATE_ON_VISIT = { dedupingInterval: 2000 };

export const useQuery = () => {
  const { setCurrentProduct, currentProduct } = useProductContext();
  const { setRepositoryList, setRepositoriesLatestTsqmi } = useRepositoryContext();

  const { query } = useRouter();

  async function loadProduct(organizationId: string, productId: string) {
    if (currentProduct && String(currentProduct.id) === String(productId)) return;
    try {
      const result = await productQuery.getProductById(organizationId, productId);
      setCurrentProduct(result.value);
    } catch (error) {
      // eslint-disable-next-line no-console
    }
  }

  const [organizationId, productId] = getPathId(query?.product as string);
  // a mesma entrada do cache que o Layout já pediu
  const { repositories } = useRepositoryList(organizationId, productId);
  const { data: latestTsqmi } = useRequest<RepositoriesLatestTsqmi>(
    productQuery.getProductRepositoriesLatestTsqmiConfig(organizationId, productId),
    REVALIDATE_ON_VISIT
  );

  useEffect(() => {
    if (repositories) setRepositoryList(repositories);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repositories]);

  useEffect(() => {
    if (latestTsqmi) setRepositoriesLatestTsqmi(latestTsqmi);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestTsqmi]);

  useEffect(() => {
    if (organizationId && productId) {
      void loadProduct(organizationId, productId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query?.product]);
};

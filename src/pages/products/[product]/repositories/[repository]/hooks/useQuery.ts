import { useEffect } from 'react';
import { useRouter } from 'next/router';

import { useRepositoryContext } from '@contexts/RepositoryProvider';
import { useProductContext } from '@contexts/ProductProvider';
import { useOrganizationContext } from '@contexts/OrganizationProvider';

import { repository } from '@services/repository';
import { productQuery } from '@services/product';

import { getPathId } from '@utils/pathDestructer';

/**
 * Dados da tela do repositório: o repositório (cabeçalho) e o último TSQMI com o badge. O pulso das
 * características vem do useRepositoryPulse. Antes o hook também buscava a árvore de entidades, os últimos
 * valores de métricas e de características, o histórico de TSQMI e de características e a comparação com a meta,
 * para componentes que a tela não usa mais: eram 6 chamadas a mais em cada abertura.
 */
export const useQuery = () => {
  const { setCurrentRepository, setLatestTSQMI, setLatestTSQMIBadgeUrl } = useRepositoryContext();

  const { setCurrentProduct, currentProduct } = useProductContext();
  const { currentOrganization, organizationList, setCurrentOrganizations } = useOrganizationContext();

  const { query } = useRouter();

  async function loadLatestTsqmi(organizationId: string, productId: string, repositoryId: string) {
    try {
      const props = {
        organizationId,
        productId,
        repositoryId,
        entity: 'tsqmi'
      };
      const { data: result } = await repository.getLatest(props);
      const badgeUrl = repository.getTsqmiBadgeUrl(props);
      setLatestTSQMI(result);
      setLatestTSQMIBadgeUrl(badgeUrl);
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
    }
  }

  async function loadProduct(organizationId: string, productId: string) {
    try {
      const result = await productQuery.getProductById(organizationId, productId);
      if (result.type === 'success') {
        setCurrentProduct(result.value);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }

  // Sincroniza a organização selecionada com base na URL (caso o usuário entre direto na página)
  useEffect(() => {
    if (query?.product && organizationList.length > 0) {
      const [organizationId] = getPathId(query?.product as string);
      if (!currentOrganization || String(currentOrganization.id) !== organizationId) {
        const matchingOrg = organizationList.find((org) => String(org.id) === organizationId);
        if (matchingOrg) {
          setCurrentOrganizations([matchingOrg]);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query?.product, organizationList]);

  // Carrega os dados do repositório quando o query muda
  useEffect(() => {
    if (query?.repository) {
      const [organizationId, productId] = getPathId(query?.product as string);
      const [repositoryId] = getPathId(query?.repository as string);

      // Clear repository-scoped state first to avoid showing stale values while new data loads.
      setCurrentRepository(undefined);
      setLatestTSQMI(undefined);
      setLatestTSQMIBadgeUrl(undefined);

      // o Layout já carrega o produto da rota; aqui só quando o do contexto é outro
      if (!currentProduct || String(currentProduct.id) !== String(productId)) {
        void loadProduct(organizationId, productId);
      }
      void loadRepository(organizationId, productId, repositoryId);
      void loadLatestTsqmi(organizationId, productId, repositoryId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query?.repository]);

  // Re-seta o currentProduct após o ProductProvider resetá-lo (ao trocar de organização).
  // O ProductProvider faz setCurrentProduct(null) quando currentOrganization muda,
  // por isso precisamos re-carregar o produto correto quando ele ficar null.
  useEffect(() => {
    if (query?.product && currentOrganization && !currentProduct) {
      const [organizationId, productId] = getPathId(query?.product as string);
      // Só re-carrega se a organização no contexto já é a correta
      if (String(currentOrganization.id) === organizationId) {
        void loadProduct(organizationId, productId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProduct, currentOrganization, query?.product]);
};

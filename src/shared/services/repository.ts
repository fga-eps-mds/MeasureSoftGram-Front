/* eslint-disable class-methods-use-this */
import api from './api';

interface HistoricalCharacteristicsProps {
  organizationId?: string;
  productId?: string;
  repositoryId?: string;
  entity: string;
}

class Repository {
  getRepository(organizationId: string, productId: string, repositoryId: string) {
    return api.get(`organizations/${organizationId}/products/${productId}/repositories/${repositoryId}/`);
  }

  getHistorical(props: HistoricalCharacteristicsProps) {
    const { organizationId, entity, productId, repositoryId } = props;
    return api.get(
      `organizations/${organizationId}` +
        `/products/${productId}/repositories/${repositoryId}` +
        `/historical-values/${entity}/`
    );
  }

  getLatest(props: HistoricalCharacteristicsProps) {
    const { organizationId, entity, productId, repositoryId } = props;
    return api.get(
      `organizations/${organizationId}` +
        `/products/${productId}/repositories/${repositoryId}` +
        `/latest-values/${entity}/`
    );
  }

  getTsqmiBadgeUrl(props: HistoricalCharacteristicsProps) {
    const { organizationId, entity, productId, repositoryId } = props;
    return (
      api.getUri() +
      `/organizations/${organizationId}` +
      `/products/${productId}/repositories/${repositoryId}` +
      `/latest-values/${entity}/badge`
    );
  }
}

export const repository = new Repository();
Object.freeze(repository);

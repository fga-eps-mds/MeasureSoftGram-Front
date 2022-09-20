/* eslint-disable class-methods-use-this */
import { Historical } from '@customTypes/repository';
import api from './api';

interface HistoricalCharacteristicsProps {
  organizationId: string;
  productId: string | undefined;
  repositoryId: string | undefined;
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
}

export const repository = new Repository();
Object.freeze(repository);

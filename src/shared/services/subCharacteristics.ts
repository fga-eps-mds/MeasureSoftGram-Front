/* eslint-disable class-methods-use-this */
import api from './api';

interface HistoricalCharacteristicsProps {
  organizationId: string;
  productId: string | undefined;
  repositoryId: string | undefined;
  entity: string;
}

class SubCharacteristics {
  getRepository(organizationId: string, productId: string, repositoryId: string) {
    return api.get(`organizations/${organizationId}/products/${productId}/repositories/${repositoryId}/`);
  }

  getHistoricalCharacteristics(props: HistoricalCharacteristicsProps) {
    const { organizationId, entity, productId, repositoryId } = props;
    return api.get(
      `organizations/${organizationId}` +
        `/products/${productId}/repositories/${repositoryId}` +
        `/historical-values/${entity}/`
    );
  }
}

export const subCharacteristics = new SubCharacteristics();
Object.freeze(subCharacteristics);

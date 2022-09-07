// /api/v1/organizations/1/products/3/repositories/6/historical-values/characteristics/
import api from './api';

interface HistoricalCharacteristicsProps {
  organizationId: number;
  productId: number;
  repositoryId: number;
  entity: 'characteristics';
}

class Historical {
  async getHistoricalCharacteristics(props: HistoricalCharacteristicsProps) {
    const { organizationId, entity, productId, repositoryId } = props;
    return api.get(
      `organizations/${organizationId}` +
        `/products/${productId}/repositories/${repositoryId}` +
        `/historical-values/${entity}/`
    );
  }
}

export const historical = new Historical();
Object.freeze(historical);

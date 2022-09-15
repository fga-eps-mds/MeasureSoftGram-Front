/* eslint-disable class-methods-use-this */
import api from './api';
import * as sqcHistorical from '../types/sqcHistorical';

interface HistoricalCharacteristicsProps {
  organizationId: number;
  productId: number;
  repositoryId: number;
  entity: 'characteristics';
}

class Historical {
  getHistoricalCharacteristics(props: HistoricalCharacteristicsProps) {
    const { organizationId, entity, productId, repositoryId } = props;
    return api.get(
      `organizations/${organizationId}` +
        `/products/${productId}/repositories/${repositoryId}` +
        `/historical-values/${entity}/`
    );
  }

  getSqcHistory(organizationId: string | number, projectId: string | number, repositoryId: string | number) {
    const url = `organizations/${organizationId}/products/${projectId}/repositories/${repositoryId}/historical-values/sqc/`;
    return api.get<sqcHistorical.RootObject>(url);
  }
}

export const historical = new Historical();
Object.freeze(historical);

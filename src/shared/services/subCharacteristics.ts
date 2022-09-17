/* eslint-disable class-methods-use-this */
import * as sqcHistorical from '@customTypes/repository';
import api from './api';

interface HistoricalCharacteristicsProps {
  organizationId: number;
  productId: number | undefined;
  repositoryId: number | undefined;
  entity: string;
}

class SubCharacteristics {
  getRepository(organizationId: string, productId: number, repositoryId: number) {
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

  getSqcHistory(organizationId: string, productId: string | number, repositoryId: number | undefined) {
    const url = `organizations/${organizationId}/products/${productId}/repositories/${repositoryId}/historical-values/sqc/`;
    return api.get<sqcHistorical.RootObject>(url);
  }
}

export const subCharacteristics = new SubCharacteristics();
Object.freeze(subCharacteristics);

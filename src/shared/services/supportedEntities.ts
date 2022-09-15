import api from './api';

class SupportedEntitiesQuery {
  async getSupportedEntities(organizationId: number, productId: number) {
    return api.get(`organizations/${organizationId}/products/${productId}/current/pre-config/`);
  }
}

export const supportedEntitiesQuery = new SupportedEntitiesQuery();
Object.freeze(supportedEntitiesQuery);

import api from './api';

class SupportedEntitiesQuery {
  async getSupportedEntities(organizationId: number | undefined, productId: number | undefined) {
    return api.get(`organizations/${organizationId}/products/${productId}/current/pre-config/`);
  }
}

export const supportedEntitiesQuery = new SupportedEntitiesQuery();
Object.freeze(supportedEntitiesQuery);

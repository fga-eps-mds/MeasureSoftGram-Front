import api from './api';

class SupportedEntitiesQuery {
  async getSupportedEntities(entity: string) {
    return api.get(`/supported-${entity}/`);
  }
}

export const supportedEntitiesQuery = new SupportedEntitiesQuery();
Object.freeze(supportedEntitiesQuery);

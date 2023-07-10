import api from './api';

/* eslint-disable class-methods-use-this */
class EntityRelationshipTreeService {
  async getEntityRelationshipTree() {
    return api.get('/entity-relationship-tree');
  }
}

export const entityRelationshipTreeService = new EntityRelationshipTreeService();
Object.freeze(entityRelationshipTreeService);

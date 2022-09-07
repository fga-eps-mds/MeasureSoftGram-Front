/* eslint-disable no-return-await */
/* eslint-disable class-methods-use-this */
import * as sqcHistorical from '../types/sqcHistorical';
import api from './api';

class RepositoryQuery {
  getSqcHistory(organizationId: string, projectId: string, repositoryId: string) {
    const url = `organizations/${organizationId}/products/${projectId}/repositories/${repositoryId}/historical-values/sqc/`;
    return api.get<sqcHistorical.RootObject>(url);
  }
}

export const repositoryQuery = new RepositoryQuery();
Object.freeze(repositoryQuery);

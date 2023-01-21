/* eslint-disable class-methods-use-this */
import {
  PreConfigEntitiesRelationship,
  CurrentPreConfig,
  MeasuresHistory,
  ReleaseGoal,
  RepositoriesSqcHistory,
  EntitiesMetrics,
  LatestValues,
} from '@customTypes/product';
import { Data } from '@customTypes/preConfig';

import api from './api';

class ProductQuery {
  async getAllProducts(organizationId: string) {
    return api.get(`/organizations/${organizationId}/products/`);
  }

  async getProductById(organizationId: string, id: string) {
    return api.get(`/organizations/${organizationId}/products/${id}/`);
  }

  async getAllRepositories(organizationId: string, productId: string) {
    return api.get(`/organizations/${organizationId}/products/${productId}/repositories`);
  }

  async getProductMeasuresHistory(organizationId: string, productId: string) {
    const url = `organizations/${organizationId}/repository/${productId}/history/measures/`;
    return api.get<MeasuresHistory>(url);
  }

  postPreConfig(organizationId: string, productId: string, data: { name: string; data: Data }) {
    return api.post(`/organizations/${organizationId}/products/${productId}/create/pre-config/`, data);
  }

  async getProductCurrentPreConfig(organizationId: string, productId: string) {
    const url = `organizations/${organizationId}/products/${productId}/current/pre-config/`;
    return api.get<CurrentPreConfig>(url);
  }

  async getPreConfigEntitiesRelationship(organizationId: string, projectId: string) {
    const url = `organizations/${organizationId}/products/${projectId}/entity-relationship-tree/`;
    return api.get<Array<PreConfigEntitiesRelationship>>(url);
  }

  async getCharacteristicsLatestValues(organizationId: string, productId: string, repositoryId: string) {
    const url = `organizations/${organizationId}/products/${productId}/repositories/${repositoryId}/latest-values/characteristics/`;
    return api.get<Array<LatestValues>>(url);
  }

  async getSubcharacteristicsLatestValues(organizationId: string, productId: string, repositoryId: string) {
    const url = `organizations/${organizationId}/products/${productId}/repositories/${repositoryId}/latest-values/subcharacteristics/`;
    return api.get<Array<LatestValues>>(url);
  }

  async getMeasuresLatestValues(organizationId: string, productId: string, repositoryId: string) {
    const url = `organizations/${organizationId}/products/${productId}/repositories/${repositoryId}/latest-values/measures/`;
    return api.get<Array<LatestValues>>(url);
  }

  async getMetricsLatestValues(organizationId: string, productId: string, repositoryId: string) {
    const url = `organizations/${organizationId}/products/${productId}/repositories/${repositoryId}/latest-values/metrics/`;
    return api.get<Array<EntitiesMetrics>>(url);
  }

  async createProductReleaseGoal(organizationId: string, productId: string, data: ReleaseGoal) {
    const url = `organizations/${organizationId}/products/${productId}/create/goal/`;
    return api.post(url, data);
  }

  async getCompareGoalAccomplished(organizationId: string, productId: string, repositoryId: Number) {
    const url = `organizations/${organizationId}/products/${productId}/all/goal/`;
    return api.get(url);
  }

  async getProductRepositoriesSqcHistory(organizationId: string, productId: string) {
    const url = `organizations/${organizationId}/products/${productId}/repositories-sqc-historical-values/`;
    return api.get<RepositoriesSqcHistory>(url);
  }
}

export const productQuery = new ProductQuery();
Object.freeze(productQuery);

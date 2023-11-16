/* eslint-disable class-methods-use-this */
import {
  PreConfigEntitiesRelationship,
  CurrentPreConfig,
  MeasuresHistory,
  ReleaseGoal,
  RepositoriesTsqmiHistory,
  EntitiesMetrics,
  LatestValues,
  Goal
} from '@customTypes/product';
import { Data } from '@customTypes/preConfig';

import { AxiosRequestConfig } from 'axios';
import api from './api';

export interface ProductFormData {
  name: string;
  key?: string;
  description?: string;
  gaugeRedLimit?: number;
  gaugeYellowLimit?: number;
}

class ProductQuery {
  async getAllProducts(organizationId: string) {
    return api.get(`/organizations/${organizationId}/products/`);
  }

  async getProductById(organizationId: string, id: string) {
    return api.get(`/organizations/${organizationId}/products/${id}/`);
  }

  async updateProduct(organizationId: string, id: string, data: ProductFormData) {
    return api.put(`/organizations/${organizationId}/products/${id}/`, data);
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

  async getCompareGoalAccomplished(organizationId: string, productId: string, releaseId?: number) {
    const url = `organizations/${organizationId}/products/${productId}/all/goal/`;
    return api.get(url, { params: releaseId && { release_id: releaseId } });
  }

  async getCurrentReleaseGoal(organizationId: string, productId: string) {
    const url = `organizations/${organizationId}/products/${productId}/current/goal/`;
    return api.get(url);
  }

  async getProductRepositoriesTsqmiHistory(organizationId: string, productId: string) {
    const url = `organizations/${organizationId}/products/${productId}/repositories-tsqmi-historical-values/`;
    return api.get<RepositoriesTsqmiHistory>(url);
  }

  async getCurrentGoal(organizationId: string, productId: string, releaseId?: number) {
    const url = `organizations/${organizationId}/products/${productId}/current/goal/`;
    return api.get<Goal>(url, { params: releaseId && { release_id: releaseId } });
  }

  getReleaseList(organizationId: string, productId: string, releaseId?: number): AxiosRequestConfig {
    const url = `organizations/${organizationId}/products/${productId}/release/`;
    return {
      url,
      method: 'get',
      params: releaseId && { release_id: releaseId }
    };
  }
}

export const productQuery = new ProductQuery();
Object.freeze(productQuery);

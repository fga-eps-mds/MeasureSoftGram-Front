/* eslint-disable class-methods-use-this */
import {
  PreConfigEntitiesRelationship,
  CurrentPreConfig,
  MeasuresHistory,
  ReleaseGoal,
  RepositoriesTsqmiHistory,
  EntitiesMetrics,
  LatestValues,
  Goal,
  Product,
  ReleasesPaginated,
  IReleases
} from '@customTypes/product';
import { Data } from '@customTypes/preConfig';

import { AxiosError, AxiosRequestConfig } from 'axios';
import { NewCreateReleaseData } from '@modules/createRelease/context/useCreateRelease';
import api from './api';

export interface ProductFormData {
  name: string;
  organizationId?: number;
  description?: string;
  key?: string;
  gaugeRedLimit?: number;
  gaugeYellowLimit?: number;
}

class ProductQuery {
  async getAllProducts(organizationId: string) {
    return api.get(`/organizations/${organizationId}/products/`);
  }

  async getProductById(organizationId: string, productId: string): Promise<Result<ProductFormData>> {
    try {
      const response = await api.get(`/organizations/${organizationId}/products/${productId}/`);
      return { type: 'success', value: response?.data };
    } catch (err) {
      const error = err as AxiosError;
      return { type: 'error', error };
    }
  }

  async updateProduct(productId: string, data: ProductFormData): Promise<Result<Product>> {
    try {
      const response = await api.put(`/organizations/${data.organizationId}/products/${productId}/`, data);
      return { type: 'success', value: response?.data };
    } catch (err) {
      const error = err as AxiosError;

      const responseData = error.response?.data as { name?: string[]; key?: string[] };
      if (error.response && error.response.status === 400) {
        if (responseData.name && responseData.name[0] === 'Product with this name already exists.') {
          return { type: 'error', error: new Error('Já existe um produto com este nome.') };
        }
      }

      return { type: 'error', error: new Error('Erro ao atualizar o produto.') };
    }
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

  async createProductGoal(organizationId: string, productId: string, data: ReleaseGoal) {
    const url = `organizations/${organizationId}/products/${productId}/create/goal/`;
    return api.post(url, data);
  }

  async createProductRelease(organizationId: string, productId: string, data: NewCreateReleaseData) {
    const url = `organizations/${organizationId}/products/${productId}/create/release/`;
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
    return api.get<any>(url, { params: releaseId && { release_id: releaseId } });
  }

  getReleasesAndPlannedXAccomplishedByID(
    organizationId: string,
    productId: string,
    releaseId: string
  ): AxiosRequestConfig {
    const url = `organizations/${organizationId}/products/${productId}/create/release/${releaseId}/planeed-x-accomplished`;
    return {
      url,
      method: 'get'
    };
  }

  getReleaseList(organizationId: string, productId: string, releaseId?: number): AxiosRequestConfig {
    const url = `organizations/${organizationId}/products/${productId}/create/release/`;
    return {
      url,
      method: 'get'
      // params: releaseId && { release_id: releaseId }
    };
  }

  async createProduct(data: ProductFormData): Promise<Result<ProductFormData>> {
    try {
      const response = await api.post(`/organizations/${data.organizationId}/products/`, data);
      return { type: 'success', value: response?.data };
    } catch (err) {
      const error = err as AxiosError;

      const responseData = error.response?.data as { name?: string[]; key?: string[] };
      if (error.response && error.response.status === 400) {
        if (responseData.name && responseData.name[0] === 'Product with this name already exists.') {
          return { type: 'error', error: new Error('Já existe um produto com este nome.') };
        }
      }

      return { type: 'error', error: new Error('Erro ao criar o produto.') };
    }
  }

  async deleteProduct(productId: string, organizationId: string | undefined): Promise<Result<void>> {
    try {
      const response = await api.delete(`/organizations/${organizationId}/products/${productId}/`);
      return { type: 'success', value: response?.data };
    } catch (err) {
      const error = err as AxiosError;
      return { type: 'error', error };
    }
  }
}

export const productQuery = new ProductQuery();
Object.freeze(productQuery);

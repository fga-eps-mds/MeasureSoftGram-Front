import axios, { AxiosError } from 'axios';
import api from './api';

interface RepositoryFormData {
  name: string;
  description?: string;
  url?: string;
  platform: string;
  imported?: boolean;
}

interface HistoricalCharacteristicsProps {
  organizationId?: string;
  productId?: string;
  repositoryId?: string;
  entity: string;
}

export type ResultSuccess<T> = { type: 'success'; value: T };
export type ResultError = { type: 'error'; error: Error | AxiosError };
export type Result<T> = ResultSuccess<T> | ResultError;

const buildRepositoryBasePath = (organizationId: string, productId: string, repositoryId: string): string =>
  `/v1/organizations/${organizationId}/products/${productId}/repositories/${repositoryId}`;

class Repository {
  private readonly apiClient = api;

  async createRepository(
    organizationId: string,
    productId: string,
    { imported = false, ...data }: RepositoryFormData
  ): Promise<Result<RepositoryFormData>> {
    try {
      const response = await this.apiClient.post(
        `/v1/organizations/${organizationId}/products/${productId}/repositories/`,
        { ...data, imported }
      );
      return { type: 'success', value: response?.data };
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return { type: 'error', error: err };
      }
      return { type: 'error', error: new Error('Failed to create repository.') };
    }
  }

  async updateRepository(
    organizationId: string,
    productId: string,
    repositoryId: string,
    { imported = false, ...data }: RepositoryFormData
  ): Promise<Result<RepositoryFormData>> {
    try {
      const response = await this.apiClient.put(
        `/v1/organizations/${organizationId}/products/${productId}/repositories/${repositoryId}/`,
        { ...data, imported }
      );
      return { type: 'success', value: response?.data };
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return { type: 'error', error: err };
      }
      return { type: 'error', error: new Error('Failed to update repository.') };
    }
  }

  async deleteRepository(organizationId: string, productId: string, repositoryId: string): Promise<Result<void>> {
    try {
      await this.apiClient.delete(
        `/v1/organizations/${organizationId}/products/${productId}/repositories/${repositoryId}/`
      );
      return { type: 'success', value: undefined };
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return { type: 'error', error: err };
      }
      return { type: 'error', error: new Error('Failed to delete repository.') };
    }
  }

  async getHistoricalData(props: HistoricalCharacteristicsProps): Promise<Result<any>> {
    try {
      const { organizationId, entity, productId, repositoryId } = props;
      const response = await this.apiClient.get(
        `/v1/organizations/${organizationId}/products/${productId}/repositories/${repositoryId}/historical-values/${entity}/`
      );
      return { type: 'success', value: response?.data };
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return { type: 'error', error: err };
      }
      return { type: 'error', error: new Error('Failed to fetch historical data.') };
    }
  }

  getRepository(organizationId: string, productId: string, repositoryId: string): Promise<Result<any>> {
    return this.apiClient.get(`${buildRepositoryBasePath(organizationId, productId, repositoryId)}/`);
  }

  getHistorical(props: HistoricalCharacteristicsProps): Promise<Result<any>> {
    const { organizationId, entity, productId, repositoryId } = props;
    const basePath = buildRepositoryBasePath(organizationId as string, productId as string, repositoryId as string);
    return this.apiClient.get(`${basePath}/historical-values/${entity}/`);
  }

  async getLatest(props: HistoricalCharacteristicsProps) {
    const { organizationId, entity, productId, repositoryId } = props;
    const basePath = buildRepositoryBasePath(organizationId as string, productId as string, repositoryId as string);

    try {
      return await this.apiClient.get(`${basePath}/latest-values/${entity}/`);
    } catch {
      return undefined;
    }
  }

  getTsqmiBadgeUrl(props: HistoricalCharacteristicsProps) {
    const { organizationId, entity, productId, repositoryId } = props;
    const basePath = buildRepositoryBasePath(organizationId as string, productId as string, repositoryId as string);
    return `${this.apiClient.getUri()}${basePath}/latest-values/${entity}/badge`;
  }

  getCharacteristicBadgeUrl(organizationId: string, productId: string, repositoryId: string, characteristicKey: string) {
    const basePath = buildRepositoryBasePath(organizationId, productId, repositoryId);
    return `${this.apiClient.getUri()}${basePath}/latest-values/characteristics/${characteristicKey}/badge/`;
  }
}

export const repository = new Repository();
Object.freeze(repository);

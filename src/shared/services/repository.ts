import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import api from './api';
import { getAccessToken } from '@services/Auth';

interface RepositoryFormData {
  name: string;
  description?: string;
  url?: string;
  platform: string;
}

interface HistoricalCharacteristicsProps {
  organizationId?: string;
  productId?: string;
  repositoryId?: string;
  entity: string;
}

export type ResultSuccess<T> = { type: 'success'; value: T };
export type ResultError = { type: 'error'; error: Error | AxiosError | any };
export type Result<T> = ResultSuccess<T> | ResultError;
class Repository {
  private async getAuthHeaders(): Promise<AxiosRequestConfig['headers']> {
    try {
      const tokenResult = await getAccessToken();
      if (tokenResult.type === 'error' || !tokenResult.value.key) {
        return {};
      }

      console.log('Authentication Token:', `Token ${tokenResult.value.key}`);

      return { Authorization: `Token ${tokenResult.value.key}` };
    } catch (error) {
      console.error('Failed to fetch authentication token:', error);
      return {};
    }
  }

  async createRepository(organizationId: string, productId: string, data: RepositoryFormData): Promise<Result<RepositoryFormData>> {
    try {
      const headers: AxiosRequestConfig['headers'] = await this.getAuthHeaders();
      if (!headers) {
        throw new Error('Access token not found.');
      }

      const response = await api.post(`/organizations/${organizationId}/products/${productId}/repositories/`, data, { headers });
      return { type: 'success', value: response?.data };
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return { type: 'error', error: err };
      }
      return { type: 'error', error: new Error('Failed to create repository.') };
    }
  }


async updateRepository(organizationId: string, productId: string, repositoryId: string, data: RepositoryFormData): Promise<Result<RepositoryFormData>> {
  try {
    const headers: AxiosRequestConfig['headers'] = await this.getAuthHeaders();
    if (!headers) {
      throw new Error('Access token not found.');
    }

    const response = await api.put(`/organizations/${organizationId}/products/${productId}/repositories/${repositoryId}/`, data, { headers });
    return { type: 'success', value: response?.data };
  } catch (err) {
    return { type: 'error', error: new Error('Failed to update repository.') };
  }
}


  async deleteRepository(organizationId: string, productId: string, repositoryId: string): Promise<Result<void>> {
    try {
      const headers: AxiosRequestConfig['headers'] = await this.getAuthHeaders();
      if (!headers) {
        throw new Error('Access token not found.');
      }
      const response = await api.delete(`/organizations/${organizationId}/products/${productId}/repositories/${repositoryId}/`, { headers });
      return { type: 'success', value: response?.data };
    } catch (err) {
      return { type: 'error', error: new Error('Failed to delete repository.') };
    }
  }

  async getHistoricalData(props: HistoricalCharacteristicsProps): Promise<Result<any>> {
    try {
      const { organizationId, entity, productId, repositoryId } = props;
      const headers: AxiosRequestConfig['headers'] = await this.getAuthHeaders();
      if (!headers) {
        throw new Error('Access token not found.');
      }
      const response = await api.get(`/organizations/${organizationId}/products/${productId}/repositories/${repositoryId}/historical-values/${entity}/`, { headers });
      return { type: 'success', value: response?.data };
    } catch (err) {
      return { type: 'error', error: new Error('Failed to fetch historical data.') };
    }
  }

  getRepository(organizationId: string, productId: string, repositoryId: string): Promise<Result<any>> {
    return api.get(`organizations/${organizationId}/products/${productId}/repositories/${repositoryId}/`);
  }

  getHistorical(props: HistoricalCharacteristicsProps): Promise<Result<any>> {
    const { organizationId, entity, productId, repositoryId } = props;
    return api.get(
      `organizations/${organizationId}` +
        `/products/${productId}/repositories/${repositoryId}` +
        `/historical-values/${entity}/`
    );
  }
}

export const repository = new Repository();
Object.freeze(repository);

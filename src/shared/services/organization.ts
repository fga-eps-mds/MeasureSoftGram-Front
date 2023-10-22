import { AxiosRequestConfig, AxiosError } from 'axios';
import api from './api';
import { getAccessToken } from '@services/Auth';

export interface OrganizationFormData {
  name: string;
  key?: string;
  description?: string;
  members?: string[];
}

export type ResultSuccess<T> = { type: 'success'; value: T };
export type ResultError = { type: 'error'; error: AxiosError };
export type Result<T> = ResultSuccess<T> | ResultError;

class OrganizationQuery {

  private async getAuthHeaders(): Promise<{ Authorization: string } | null> {
    const tokenResult = await getAccessToken();
    if (tokenResult.type === 'error' || !tokenResult.value.key) {
      return null;
    }

    console.log('Token de Autenticação:', `Token ${tokenResult.value.key}`);

    return { Authorization: `Token ${tokenResult.value.key}` };
  }

  async createOrganization(data: OrganizationFormData): Promise<Result<OrganizationFormData>> {
    try {
      const headers = await this.getAuthHeaders();
      if (!headers) {
        throw new Error('Token de acesso não encontrado.');
      }
      const response = await api.post('/organizations/', data, { headers });
      console.log('Criando organização com os dados:', data);
      return { type: 'success', value: response?.data };
    } catch (err) {
      const error = err as AxiosError;
      console.log('Criando organização com os dados:', err);
      return { type: 'error', error };
    }
  }

  async getOrganizationById(id: string): Promise<Result<OrganizationFormData>> {
    try {
      const headers = await this.getAuthHeaders();
      if (!headers) {
        throw new Error('Token de acesso não encontrado.');
      }
      const response = await api.get(`/organizations/${id}/`, { headers });
      return { type: 'success', value: response?.data };
    } catch (err) {
      const error = err as AxiosError;
      return { type: 'error', error };
    }
  }

async getAllOrganization(): Promise<AxiosRequestConfig> {
    const headers = await this.getAuthHeaders();
    if (!headers) {
        throw new Error('Token de acesso não encontrado.');
    }

    return {
        method: 'GET',
        url: '/organizations/',
        headers
    };
}


  async updateOrganization(id: string, data: OrganizationFormData): Promise<Result<void>> {
    try {
      const headers = await this.getAuthHeaders();
      if (!headers) {
        throw new Error('Token de acesso não encontrado.');
      }
      const response = await api.put(`/organizations/${id}/`, data, { headers });
      return { type: 'success', value: response?.data };
    } catch (err) {
      const error = err as AxiosError;
      return { type: 'error', error };
    }
  }

  async deleteOrganization(id: string): Promise<Result<void>> {
    try {
      const headers = await this.getAuthHeaders();
      if (!headers) {
        throw new Error('Token de acesso não encontrado.');
      }
      const response = await api.delete(`/organizations/${id}/`, { headers });
      return { type: 'success', value: response?.data };
    } catch (err) {
      const error = err as AxiosError;
      return { type: 'error', error };
    }
  }
}

export const organizationQuery = new OrganizationQuery();
Object.freeze(organizationQuery);

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
export type ResultError = { type: 'error'; error: Error | AxiosError };
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
      console.log('Erro ao criar organização:', err);

      const responseData = error.response?.data as { name?: string[], key?: string[] };
      if (error.response && error.response.status === 400) {
        if (responseData.name && responseData.name[0] === "Organization with this name already exists.") {
          return { type: 'error', error: new Error('Já existe uma organização com este nome.') };
        }
        if (responseData.key && responseData.key[0] === "Organization with this key already exists.") {
          return { type: 'error', error: new Error('Já existe uma organização com esta chave.') };
        }
      }

      return { type: 'error', error: new Error('Ocorreu um erro ao criar organização.') };
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

      const responseData = error.response?.data as { name?: string[], key?: string[] };
      if (error.response && error.response.status === 400) {
        if (responseData.name && responseData.name[0] === "Organization with this name already exists.") {
          return { type: 'error', error: new Error('Já existe uma organização com este nome.') };
        }
        if (responseData.key && responseData.key[0] === "Organization with this key already exists.") {
          return { type: 'error', error: new Error('Já existe uma organização com esta chave.') };
        }
      }

      return { type: 'error', error: new Error('Ocorreu um erro ao atualizar organização.') };
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

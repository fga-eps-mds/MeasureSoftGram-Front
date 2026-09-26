import { AxiosError } from 'axios';
import { getAccessToken } from '@services/Auth';
import api from './api';

export interface OrganizationFormData {
  id?: string;
  name: string;
  key?: string;
  description?: string;
  members?: string[];
  url?: string;
  products?: string[];
}


export type ResultSuccess<T> = { type: 'success'; value: T };
export type ResultError = { type: 'error'; error: Error | AxiosError };
export type Result<T> = ResultSuccess<T> | ResultError;

class OrganizationQuery {

  // eslint-disable-next-line class-methods-use-this
  private async getAuthHeaders(): Promise<{ Authorization: string }> {
    const tokenResult = await getAccessToken();
    if (tokenResult.type === 'error' || !tokenResult.value.key) {
      throw new Error('Token de acesso não encontrado.');
    }

    return { Authorization: `Token ${tokenResult.value.key}` };
  }

async getAllOrganization(): Promise<Result<OrganizationFormData[]>> {
  try {
    const headers = await this.getAuthHeaders();
    const response = await api.get('/v1/organizations/', { headers });
    return { type: 'success', value: response.data.results as OrganizationFormData[] };
  } catch (error) {
    return { type: 'error', error: error as AxiosError };
  }
}

async createOrganization(data: OrganizationFormData): Promise<Result<OrganizationFormData>> {
    try {
      const headers = await this.getAuthHeaders();
      if (!headers) {
        throw new Error('Token de acesso não encontrado.');
      }
      const response = await api.post('/v1/organizations/', data, { headers });
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

      return { type: 'error', error: new Error('Ocorreu um erro ao criar organização.') };
    }
  }

  async getOrganizationById(id: string): Promise<Result<OrganizationFormData>> {
    try {
      const headers = await this.getAuthHeaders();
      if (!headers) {
        throw new Error('Token de acesso não encontrado.');
      }
      const response = await api.get(`/v1/organizations/${id}/`, { headers });
      return { type: 'success', value: response?.data };
    } catch (err) {
      const error = err as AxiosError;
      return { type: 'error', error };
    }
  }


async updateOrganization(id: string, data: OrganizationFormData): Promise<Result<void>> {
    try {
      const headers = await this.getAuthHeaders();
      if (!headers) {
        throw new Error('Token de acesso não encontrado.');
      }
      const response = await api.put(`/v1/organizations/${id}/`, data, { headers });
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
      const response = await api.delete(`/v1/organizations/${id}/`, { headers });
      return { type: 'success', value: response?.data };
    } catch (err) {
      const error = err as AxiosError;
      return { type: 'error', error };
    }
  }

  async getGithubOrganizations(): Promise<Result<GitHubOrganization[]>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await api.get('/v1/accounts/github-organizations/', { headers });
      return { type: 'success', value: response.data as GitHubOrganization[] };
    } catch (error) {
      return { type: 'error', error: error as AxiosError };
    }
  }

  async importOrganization(githubOrgName: string): Promise<Result<OrganizationFormData>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await api.post(
        '/v1/organizations/import/',
        { github_org_name: githubOrgName },
        { headers }
      );
      return { type: 'success', value: response.data as OrganizationFormData };
    } catch (error) {
      return { type: 'error', error: error as AxiosError };
    }
  }

  async getGithubRepos(orgId: string): Promise<Result<GitHubRepo[]>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await api.get(`/v1/organizations/${orgId}/github-repos/`, { headers });
      return { type: 'success', value: response.data as GitHubRepo[] };
    } catch (error) {
      return { type: 'error', error: error as AxiosError };
    }
  }
}

export interface GitHubOrganization {
  github_org_id: number;
  github_org_name: string;
  avatar_url: string;
  description: string;
}

export interface GitHubRepo {
  github_repo_id: number;
  github_full_name: string;
  name: string;
  description: string;
  url: string;
}

export const organizationQuery = new OrganizationQuery();
Object.freeze(organizationQuery);

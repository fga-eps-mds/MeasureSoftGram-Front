import { AxiosError } from 'axios';
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

// O GitLab manda X-Next-Page vazio na última página e omite X-Total-Pages acima de 10 mil itens.
const parsePageHeader = (value?: string): number | null => {
  const page = Number(value);
  return value && Number.isInteger(page) && page > 0 ? page : null;
};

class OrganizationQuery {
  async getAllOrganization(): Promise<Result<OrganizationFormData[]>> {
    try {
      const response = await api.get('/v1/organizations/');
      return { type: 'success', value: response.data.results as OrganizationFormData[] };
    } catch (error) {
      return { type: 'error', error: error as AxiosError };
    }
  }

  async createOrganization(data: OrganizationFormData): Promise<Result<OrganizationFormData>> {
    try {
      const response = await api.post('/v1/organizations/', data);
      return { type: 'success', value: response?.data };
    } catch (err) {
      const error = err as AxiosError;

      const responseData = error.response?.data as { name?: string[]; key?: string[] };
      if (error.response && error.response.status === 400) {
        if (responseData.name && responseData.name[0] === 'Organization with this name already exists.') {
          return { type: 'error', error: new Error('Já existe uma organização com este nome.') };
        }
        if (responseData.key && responseData.key[0] === 'Organization with this key already exists.') {
          return { type: 'error', error: new Error('Já existe uma organização com esta chave.') };
        }
      }

      return { type: 'error', error: new Error('Ocorreu um erro ao criar organização.') };
    }
  }

  async getOrganizationById(id: string): Promise<Result<OrganizationFormData>> {
    try {
      const response = await api.get(`/v1/organizations/${id}/`);
      return { type: 'success', value: response?.data };
    } catch (err) {
      const error = err as AxiosError;
      return { type: 'error', error };
    }
  }

  async updateOrganization(id: string, data: OrganizationFormData): Promise<Result<void>> {
    try {
      const response = await api.put(`/v1/organizations/${id}/`, data);
      return { type: 'success', value: response?.data };
    } catch (err) {
      const error = err as AxiosError;

      const responseData = error.response?.data as { name?: string[]; key?: string[] };
      if (error.response && error.response.status === 400) {
        if (responseData.name && responseData.name[0] === 'Organization with this name already exists.') {
          return { type: 'error', error: new Error('Já existe uma organização com este nome.') };
        }
        if (responseData.key && responseData.key[0] === 'Organization with this key already exists.') {
          return { type: 'error', error: new Error('Já existe uma organização com esta chave.') };
        }
      }

      return { type: 'error', error: new Error('Ocorreu um erro ao atualizar organização.') };
    }
  }

  async deleteOrganization(id: string): Promise<Result<void>> {
    try {
      const response = await api.delete(`/v1/organizations/${id}/`);
      return { type: 'success', value: response?.data };
    } catch (err) {
      const error = err as AxiosError;
      return { type: 'error', error };
    }
  }

  async getGithubOrganizations(): Promise<Result<GitHubOrganization[]>> {
    try {
      const response = await api.get('/v1/accounts/github-organizations/');
      return { type: 'success', value: response.data as GitHubOrganization[] };
    } catch (error) {
      return { type: 'error', error: error as AxiosError };
    }
  }

  async importOrganization(githubOrgName: string): Promise<Result<OrganizationFormData>> {
    try {
      const response = await api.post(
        '/v1/organizations/import/',
        { github_org_name: githubOrgName }
      );
      return { type: 'success', value: response.data as OrganizationFormData };
    } catch (error) {
      return { type: 'error', error: error as AxiosError };
    }
  }

  async importGitlabGroup(gitlabGroupId: number | string): Promise<Result<OrganizationFormData>> {
    try {
      const response = await api.post('/v1/organizations/import-gitlab/', { gitlab_group_id: gitlabGroupId });
      return { type: 'success', value: response.data as OrganizationFormData };
    } catch (error) {
      return { type: 'error', error: error as AxiosError };
    }
  }

  async getGithubRepos(
    orgId: string,
    page?: number,
    search?: string,
    excludeProductId?: string
  ): Promise<Result<GitHubReposPage>> {
    try {
      const params: Record<string, any> = {};
      if (excludeProductId) {
        params.exclude_product = excludeProductId;
      }
      if (page !== undefined && page !== null) {
        params.page = page;
      }
      if (search !== undefined && search !== null && search !== '') {
        params.search = search;
      }
      const response = await api.get(`/v1/organizations/${orgId}/github-repos/`, { params });
      return {
        type: 'success',
        value: {
          repos: response.data as GitHubRepo[],
          totalPages: parsePageHeader(response.headers?.['x-total-pages']),
          nextPage: parsePageHeader(response.headers?.['x-next-page'])
        }
      };
    } catch (error) {
      return { type: 'error', error: error as AxiosError };
    }
  }

  async getGitLabNamespaces(): Promise<Result<GitLabNamespace[]>> {
    try {
      const response = await api.get('/v1/accounts/gitlab-namespaces/');
      const data = Array.isArray(response.data) ? response.data : (response.data?.results ?? response.data);
      return { type: 'success', value: data as GitLabNamespace[] };
    } catch (error) {
      return { type: 'error', error: error as AxiosError };
    }
  }

  async getGitLabProjects(
    orgId: string,
    namespaceId?: number | string,
    kind?: string,
    page?: number,
    search?: string,
    excludeProductId?: string
  ): Promise<Result<GitLabProjectsPage>> {
    try {
      const params: Record<string, any> = {};
      if (excludeProductId) {
        params.exclude_product = excludeProductId;
      }
      if (namespaceId !== undefined && namespaceId !== null && namespaceId !== '') {
        params.namespace_id = namespaceId;
      }
      if (kind) {
        params.kind = kind;
      }
      if (page !== undefined && page !== null) {
        params.page = page;
      }
      if (search !== undefined && search !== null && search !== '') {
        params.search = search;
      }
      const response = await api.get(`/v1/organizations/${orgId}/gitlab-projects/`, { params });
      const data = Array.isArray(response.data) ? response.data : (response.data?.results ?? response.data);
      return {
        type: 'success',
        value: {
          projects: data as GitLabProject[],
          totalPages: parsePageHeader(response.headers?.['x-total-pages']),
          nextPage: parsePageHeader(response.headers?.['x-next-page'])
        }
      };
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

export interface GitLabNamespace {
  id: number;
  name: string;
  full_path: string;
  avatar_url: string;
  description: string;
  kind: 'user' | 'group';
}

export interface GitLabProject {
  gitlab_project_id: number;
  gitlab_path_with_namespace: string;
  name: string;
  description: string;
  url: string;
}

export interface GitHubReposPage {
  repos: GitHubRepo[];
  totalPages: number | null;
  nextPage: number | null;
}

export interface GitLabProjectsPage {
  projects: GitLabProject[];
  totalPages: number | null;
  nextPage: number | null;
}

export const organizationQuery = new OrganizationQuery();
Object.freeze(organizationQuery);


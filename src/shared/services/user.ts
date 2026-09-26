import { AxiosError } from 'axios';
import { getAccessToken } from '@services/Auth';
import api from './api';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface UserResult {
  count: number;
  next: null | string;
  previous: null | string;
  results: User[];
}

type ResultSuccess<T> = { type: 'success'; value: T };
type ResultError = { type: 'error'; error: AxiosError };
type Result<T> = ResultSuccess<T> | ResultError;

export const getAllUsers = async (): Promise<Result<UserResult>> => {
  try {
    const tokenResult = await getAccessToken();

    if (tokenResult.type === 'error' || !tokenResult.value.key) {
      console.error('Erro ao obter o token de acesso');
      return { type: 'error', error: new Error('Token de acesso não encontrado.') as AxiosError };
    }

    const token = tokenResult.value.key;

    const response = await api.get('/v1/accounts/users/', {
      headers: {
        Authorization: `Token ${token}`
      }
    });

    return { type: 'success', value: response.data };
  } catch (err) {
    const error = err as AxiosError;
    console.error('Erro ao chamar a API:', error, error.response, error.message);
    return { type: 'error', error };
  }
};

export type Repo = {
  id: number;
  name: string;
  html_url: string;
  description: string;
};

type GetUserRepoResponse = {
  total_count: number;
  items: Repo[];
};

export async function getUserRepos(code: string): Promise<Result<GetUserRepoResponse>> {
  try {
    const response = await api.get('/v1/accounts/user-repos', { params: { code } });
    return { type: 'success', value: response.data };
  } catch (err) {
    const error = err as AxiosError;
    return { type: 'error', error };
  }
}

export async function getGithubUser(accessToken: string) {
  try {
    return await api.get(`https://api.github.com/user`, {
      headers: {
        Authorization: `token ${accessToken}`
      }
    });
  } catch (err) {
    const error = err as AxiosError;
    return { type: 'error', error };
  }
}

export async function getUserRepositories(userName: string) {
  try {
    return await api.get(`https://api.github.com/search/repositories?q=user:${userName}`);
  } catch (err) {
    const error = err as AxiosError;
    return { type: 'error', error };
  }
}

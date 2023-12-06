import api from './api';
import { AxiosError } from 'axios';
import { getAccessToken } from '@services/Auth';

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
      console.error("Erro ao obter o token de acesso");
      return { type: 'error', error: new Error('Token de acesso não encontrado.') as AxiosError };
    }

    const token = tokenResult.value.key;



    const response = await api.get('/accounts/users/', {
      headers: {
        Authorization: `Token ${token}`
      }
    });



    return { type: 'success', value: response.data };
  } catch (err) {
    const error = err as AxiosError;
    console.error("Erro ao chamar a API:", error, error.response, error.message);
    return { type: 'error', error };
  }
};

import api from '@services/api';
import { AxiosError } from 'axios';

export const signInCredentials = async (code: string): Promise<Result<void>> => {
  try {
    const response = await api.post('accounts/github/login/', code);

    return { type: 'success', value: response?.data };
  } catch (err) {
    const error = err as AxiosError;
    return { type: 'error', error };
  }
};

export const signInGithub = async (code: string): Promise<Result<{ key: string }>> => {
  try {
    const response = await api.post('accounts/github/login/', { code });

    return { type: 'success', value: response?.data };
  } catch (err) {
    const error = err as AxiosError;
    return { type: 'error', error };
  }
};

export const signUp = async (data: SignUpFormData): Promise<Result<void>> => {
  try {
    const response = await api.post('accounts/signin/', data);

    return { type: 'success', value: response?.data };
  } catch (err) {
    const error = err as AxiosError;
    return { type: 'error', error };
  }
};

export const signOut = async (): Promise<Result<void>> => {
  try {
    const response = await api.delete('accounts/logout/');

    return { type: 'success', value: response?.data };
  } catch (err) {
    const error = err as AxiosError;
    return { type: 'error', error };
  }
};

export const getUserInfo = async (): Promise<Result<User>> => {
  try {
    const response = await api.get('/accounts/');

    return { type: 'success', value: response?.data };
  } catch (err) {
    const error = err as AxiosError;
    return { type: 'error', error };
  }
};

export const getGithubAuthUrl = () =>
  `https://github.com/login/oauth/authorize?client_id=ec924c8ae89f8bac950a&redirect_uri=http://127.0.0.1:3000`;

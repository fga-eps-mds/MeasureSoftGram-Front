import api from '@services/api';
import { AxiosError } from 'axios';

export const signInCredentials = async (data: LoginFormData): Promise<Result<User>> => {
  try {
    const response = await api.post('/accounts/login/', data);

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

export const getAccessToken = async (): Promise<Result<User>> => {
  try {
    const response = await api.get('/accounts/access-token');

    console.log('Access Token:', response?.data);

    return { type: 'success', value: response?.data };
  } catch (err) {
    const error = err as AxiosError;
    return { type: 'error', error };
  }
};

export const getGithubAuthUrl = () =>
  `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.LOGIN_REDIRECT_URL}`;

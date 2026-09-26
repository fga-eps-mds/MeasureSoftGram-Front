import api from '@services/api';
import { AxiosError } from 'axios';

export const signInCredentials = async (data: LoginFormData): Promise<Result<User>> => {
  try {
    const response = await api.post('/v1/accounts/login/', data);

    return { type: 'success', value: response?.data };
  } catch (err) {
    const error = err as AxiosError;
    return { type: 'error', error };
  }
};

export const signInGithub = async (code: string): Promise<Result<{ key: string }>> => {
  try {
    const response = await api.post('/v1/accounts/github/login/', { code });

    return { type: 'success', value: response?.data };
  } catch (err) {
    const error = err as AxiosError;
    return { type: 'error', error };
  }
};

export const signUp = async (data: SignUpFormData): Promise<Result<void>> => {
  try {
    const response = await api.post('/v1/accounts/signin/', data);

    return { type: 'success', value: response?.data };
  } catch (err) {
    const error = err as AxiosError;
    return { type: 'error', error };
  }
};

export const signOut = async (): Promise<Result<void>> => {
  try {
    const response = await api.delete('/v1/accounts/logout/');

    return { type: 'success', value: response?.data };
  } catch (err) {
    const error = err as AxiosError;
    return { type: 'error', error };
  }
};

export const getUserInfo = async (): Promise<Result<User>> => {
  try {
    const response = await api.get('/v1/accounts/');

    return { type: 'success', value: response?.data };
  } catch (err) {
    const error = err as AxiosError;
    return { type: 'error', error };
  }
};

export const getAccessToken = async (): Promise<Result<User>> => {
  try {
    const response = await api.get('/v1/accounts/access-token');

    return { type: 'success', value: response?.data };
  } catch (err) {
    const error = err as AxiosError;
    return { type: 'error', error };
  }
};

export const getGithubAuthUrl = () =>
  `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.LOGIN_REDIRECT_URL}&scope=repo,read:org,user`;

export const getGithubAuthUrlToRepositoriesPage = (pathName: string) =>
  `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.LOGIN_REDIRECT_URL}&state=${pathName}&scope=repo,read:org,user&prompt=select_account`;

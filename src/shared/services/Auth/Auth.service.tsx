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
    const responseData = error.response?.data as { non_field_errors?: string[] } | undefined;
    const serviceMessage = responseData?.non_field_errors?.[0];

    return { type: 'error', error: serviceMessage ? new Error(serviceMessage) : error };
  }
};

export const signInGitlab = async (code: string): Promise<Result<{ key: string }>> => {
  try {
    const response = await api.post('/v1/accounts/gitlab/login/', { code });

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

const buildGithubAuthUrl = (state?: string) => {
  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || '',
    redirect_uri: process.env.NEXT_PUBLIC_LOGIN_REDIRECT_URL || '',
    scope: 'repo read:org user'
  });

  if (state) {
    params.set('state', state);
    params.set('prompt', 'select_account');
  }

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
};

export const getGithubAuthUrl = () => buildGithubAuthUrl();

export const getLoginOrigin = (): string | null => {
  try {
    return new URL(process.env.NEXT_PUBLIC_LOGIN_REDIRECT_URL || '').origin;
  } catch {
    return null;
  }
};

export const getGithubAuthUrlToRepositoriesPage = (pathName: string) => buildGithubAuthUrl(pathName);

export const getGitlabAuthUrl = () =>
  `https://gitlab.com/oauth/authorize?client_id=${process.env.GITLAB_CLIENT_ID}&redirect_uri=${process.env.LOGIN_REDIRECT_URL}&response_type=code&scope=read_user+openid+profile+email`;

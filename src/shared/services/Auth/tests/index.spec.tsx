import { AxiosResponse } from 'axios';
import api from '@services/api';
import {
  signInCredentials,
  signInGithub,
  signUp,
  signOut,
  getUserInfo,
  getAccessToken
} from '../index'; // Ajuste o caminho conforme necessário


// Mock manual do módulo 'api'
jest.mock('@services/api', () => ({
  post: jest.fn(),
  get: jest.fn(),
  delete: jest.fn(),
}));


describe('Auth Service', () => {

  // Teste para signInCredentials
  it('successfully signs in with credentials', async () => {
    const mockData = { token: 'fakeToken' };
    const data = { email: 'user@user.com', password: 'pass' };

    // Implementação manual para simular uma resposta bem-sucedida
    (api.post as jest.Mock).mockImplementation(() =>
      Promise.resolve({ data: mockData } as AxiosResponse)
    );

    const result = await signInCredentials(data);

    expect(result).toEqual({ type: 'success', value: mockData });
  });

  it('handles sign in with credentials error', async () => {
    const error = new Error('Network Error');

    // Implementação manual para simular uma falha
    (api.post as jest.Mock).mockImplementation(() => Promise.reject(error));

    const data = { email: 'user@user.com', password: 'pass' };

    const result = await signInCredentials(data);

    expect(result).toEqual({ type: 'error', error });
  });

  // Continuação dos testes...

  // Testes para signInGithub
  it('successfully signs in with GitHub', async () => {
    const mockData = { key: 'fakeKey' };
    const code = 'githubCode';

    (api.post as jest.Mock).mockImplementation(() =>
      Promise.resolve({ data: mockData } as AxiosResponse)
    );

    const result = await signInGithub(code);

    expect(result).toEqual({ type: 'success', value: mockData });
  });

  it('handles sign in with GitHub error', async () => {
    const error = new Error('Network Error');
    const code = 'githubCode';

    (api.post as jest.Mock).mockImplementation(() => Promise.reject(error));

    const result = await signInGithub(code);

    expect(result).toEqual({ type: 'error', error });
  });

  // Testes para signUp
  it('successfully signs up', async () => {
    const mockData = {};
    const data = {
      username: 'teste123',
      first_name: 'teste',
      last_name: 'teste',
      email: 'teste@user.com',
      password: 'userteste',
      confirmPassword: '12345'
    };

    (api.post as jest.Mock).mockImplementation(() =>
      Promise.resolve({ data: mockData } as AxiosResponse)
    );

    const result = await signUp(data);

    expect(result).toEqual({ type: 'success', value: mockData });
  });

  it('handles sign up error', async () => {
    const error = new Error('Network Error');
    const data = {
      username: 'teste123',
      first_name: 'teste',
      last_name: 'teste',
      email: 'teste@user.com',
      password: 'userteste',
      confirmPassword: '12345'
    };

    (api.post as jest.Mock).mockImplementation(() => Promise.reject(error));

    const result = await signUp(data);

    expect(result).toEqual({ type: 'error', error });
  });

  // Testes para signOut
  it('successfully signs out', async () => {
    const mockData = {};

    (api.delete as jest.Mock).mockImplementation(() =>
      Promise.resolve({ data: mockData } as AxiosResponse)
    );

    const result = await signOut();

    expect(result).toEqual({ type: 'success', value: mockData });
  });

  it('handles sign out error', async () => {
    const error = new Error('Network Error');

    (api.delete as jest.Mock).mockImplementation(() => Promise.reject(error));

    const result = await signOut();

    expect(result).toEqual({ type: 'error', error });
  });

  // Testes para getUserInfo
  it('successfully gets user info', async () => {
    const mockData = { user: 'userInfo' };

    (api.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({ data: mockData } as AxiosResponse)
    );

    const result = await getUserInfo();

    expect(result).toEqual({ type: 'success', value: mockData });
  });

  it('handles get user info error', async () => {
    const error = new Error('Network Error');

    (api.get as jest.Mock).mockImplementation(() => Promise.reject(error));

    const result = await getUserInfo();

    expect(result).toEqual({ type: 'error', error });
  });

  // Testes para getAccessToken
  it('successfully gets access token', async () => {
    const mockData = { token: 'accessToken' };

    (api.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({ data: mockData } as AxiosResponse)
    );

    const result = await getAccessToken();

    expect(result).toEqual({ type: 'success', value: mockData });
  });

  it('handles get access token error', async () => {
    const error = new Error('Network Error');

    (api.get as jest.Mock).mockImplementation(() => Promise.reject(error));

    const result = await getAccessToken();

    expect(result).toEqual({ type: 'error', error });
  });

  // ... Fim dos testes


});

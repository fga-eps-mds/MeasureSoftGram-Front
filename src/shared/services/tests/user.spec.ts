import * as authService from '@services/Auth';
import api from '../api';
import * as userService from '../user';

jest.mock('../api');

jest.mock('@services/Auth', () => ({
  getAccessToken: jest.fn()
}));

describe('User Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve buscar todos os usuários com sucesso (getAllUsers)', async () => {
    (authService.getAccessToken as jest.Mock).mockResolvedValue({
      type: 'success',
      value: { key: 'mock-token' }
    });

    const mockData = { count: 1, next: null, previous: null, results: [{ id: 1, username: 'Zafiro' }] };
    (api.get as jest.Mock).mockResolvedValue({ data: mockData });

    const result = await userService.getAllUsers();

    expect(api.get).toHaveBeenCalledWith('/v1/accounts/users/', {
      headers: { Authorization: 'Token mock-token' }
    });
    expect(result).toEqual({ type: 'success', value: mockData });
  });

  it('deve retornar erro no getAllUsers se o token não for encontrado', async () => {
    (authService.getAccessToken as jest.Mock).mockResolvedValue({
      type: 'error',
      error: new Error('Sem token')
    });

    const result = await userService.getAllUsers();

    expect(result.type).toBe('error');
    expect(api.get).not.toHaveBeenCalled();
  });

  it('deve buscar os repositórios do usuário com sucesso (getUserRepos)', async () => {
    const mockData = { total_count: 1, items: [{ id: 1, name: 'repo-teste' }] };
    (api.get as jest.Mock).mockResolvedValue({ data: mockData });

    const result = await userService.getUserRepos('codigo-123');

    expect(api.get).toHaveBeenCalledWith('/v1/accounts/user-repos', { params: { code: 'codigo-123' } });
    expect(result).toEqual({ type: 'success', value: mockData });
  });

  it('deve buscar o usuário no Github (getGithubUser)', async () => {
    const mockData = { login: 'zafiro', id: 123 };
    (api.get as jest.Mock).mockResolvedValue(mockData);

    const result = await userService.getGithubUser('token-github');

    expect(api.get).toHaveBeenCalledWith('https://api.github.com/user', {
      headers: { Authorization: 'token token-github' }
    });
    expect(result).toEqual(mockData);
  });
});

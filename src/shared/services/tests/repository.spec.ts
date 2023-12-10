import axios from 'axios';
import { repository } from '../repository';

jest.mock('../api', () => ({
  api: {
    interceptors: {
      request: {
        use: jest.fn(),
      },
      response: {
        use: jest.fn(),
      },
    },
    // Adicione outros métodos conforme necessário
  },
}));

// Mock Axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Repository', () => {
  describe('createRepository', () => {
    it('should handle an error when creating a repository', async () => {
      // Simule uma falha na API
      mockedAxios.post.mockRejectedValue(new Error('Failed to create repository'));

      // Execute o método
      const result = await repository.createRepository('org1', 'prod1', { name: 'Test Repo', platform: 'GitHub' });

      // Verifique o resultado
      expect(result.type).toEqual('error');
    });
  });

  // Adicione mais testes para os outros métodos da classe Repository
});

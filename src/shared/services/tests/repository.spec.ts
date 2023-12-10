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

  describe('updateRepository', () => {
    it('should handle an error when updating a repository', async () => {
      // Simule uma falha na API
      mockedAxios.put.mockRejectedValue(new Error('Failed to update repository'));

      // Execute o método
      const result = await repository.updateRepository('org1', 'prod1', 'repo1', { name: 'Updated Repo', platform: 'GitLab' });

      // Verifique o resultado
      expect(result.type).toEqual('error');
    });
  });

  describe('deleteRepository', () => {
    it('should handle an error when deleting a repository', async () => {
      // Simule uma falha na API
      mockedAxios.delete.mockRejectedValue(new Error('Failed to delete repository'));

      // Execute o método
      const result = await repository.deleteRepository('org1', 'prod1', 'repo1');

      // Verifique o resultado
      expect(result.type).toEqual('error');
    });
  });

  describe('getHistoricalData', () => {
      it('should handle an error when fetching historical data', async () => {
      // Simule uma falha na API
      mockedAxios.get.mockRejectedValue(new Error('Failed to fetch historical data'));

      // Execute o método
      const result = await repository.getHistoricalData({ organizationId: 'org1', productId: 'prod1', repositoryId: 'repo1', entity: 'commits' });

      // Verifique o resultado
      expect(result.type).toEqual('error');
    });
  });

});

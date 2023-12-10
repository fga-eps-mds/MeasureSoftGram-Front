import axios from 'axios';
import { organizationQuery } from '../organization';

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


describe('OrganizationQuery', () => {
  describe('createOrganization', () => {
    it('should handle error when creating an organization', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Error'));

      const result = await organizationQuery.createOrganization({ name: 'Test Org' });
      expect(result.type).toBe('error');
    });
  });

  describe('getOrganizationById', () => {
    it('should handle error when retrieving organization data by id', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Error'));

      const result = await organizationQuery.getOrganizationById('123');
      expect(result.type).toBe('error');
    });
  });

  describe('deleteOrganization', () => {
    it('should handle error when deleting an organization', async () => {
      mockedAxios.delete.mockRejectedValue(new Error('Error'));

      const result = await organizationQuery.deleteOrganization('123');
      expect(result.type).toBe('error');
    });
  });


});

import { getAccessToken } from '@services/Auth';
import { repository } from '../repository';
import api from '../api';

jest.mock('../api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    getUri: jest.fn(() => 'http://api.test')
  }
}));

// Mock do Auth para que getAuthHeaders resolva sem chamar a rede real.
jest.mock('@services/Auth', () => ({
  getAccessToken: jest.fn().mockResolvedValue({ type: 'success', value: { key: 'mock-token' } })
}));

const mockedApi = api as jest.Mocked<typeof api>;
const mockedGetAccessToken = getAccessToken as jest.Mock;
const REPO1_PATH = '/v1/organizations/org1/products/prod1/repositories/repo1/';

describe('Repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createRepository', () => {
    it('should handle an error when creating a repository', async () => {
      // Simule uma falha na API
      (mockedApi.post as jest.Mock).mockRejectedValue(new Error('Failed to create repository'));

      // Execute o método
      const result = await repository.createRepository('org1', 'prod1', { name: 'Test Repo', platform: 'GitHub' });

      // Verifique o resultado
      expect(result.type).toEqual('error');
    });
  });

  describe('updateRepository', () => {
    it('should handle an error when updating a repository', async () => {
      // Simule uma falha na API
      (mockedApi.put as jest.Mock).mockRejectedValue(new Error('Failed to update repository'));

      // Execute o método
      const result = await repository.updateRepository('org1', 'prod1', 'repo1', {
        name: 'Updated Repo',
        platform: 'GitLab'
      });

      // Verifique o resultado
      expect(result.type).toEqual('error');
    });
  });

  describe('deleteRepository', () => {
    it('should handle an error when deleting a repository', async () => {
      // Simule uma falha na API
      (mockedApi.delete as jest.Mock).mockRejectedValue(new Error('Failed to delete repository'));

      // Execute o método
      const result = await repository.deleteRepository('org1', 'prod1', 'repo1');

      // Verifique o resultado
      expect(result.type).toEqual('error');
    });
  });

  describe('getHistoricalData', () => {
    it('should handle an error when fetching historical data', async () => {
      // Simule uma falha na API
      (mockedApi.get as jest.Mock).mockRejectedValue(new Error('Failed to fetch historical data'));

      // Execute o método
      const result = await repository.getHistoricalData({
        organizationId: 'org1',
        productId: 'prod1',
        repositoryId: 'repo1',
        entity: 'commits'
      });

      // Verifique o resultado
      expect(result.type).toEqual('error');
    });
  });

  describe('versiona rotas com /v1', () => {
    it('getRepository should call api.get with the /v1 prefixed URL', async () => {
      (mockedApi.get as jest.Mock).mockResolvedValue({ data: { id: 'repo1' } });

      await repository.getRepository('org1', 'prod1', 'repo1');

      expect(mockedApi.get).toHaveBeenCalledWith(REPO1_PATH);
    });

    it('createRepository should call api.post with the /v1 prefixed URL', async () => {
      (mockedApi.post as jest.Mock).mockResolvedValue({ data: {} });

      await repository.createRepository('org1', 'prod1', { name: 'Test Repo', platform: 'GitHub' });

      expect(mockedApi.post).toHaveBeenCalledWith(
        '/v1/organizations/org1/products/prod1/repositories/',
        { name: 'Test Repo', platform: 'GitHub', imported: false },
        expect.any(Object)
      );
    });
  });

  describe('autenticação ausente', () => {
    it('createRepository retorna erro quando getAccessToken falha', async () => {
      mockedGetAccessToken.mockResolvedValueOnce({ type: 'error' });

      const result = await repository.createRepository('org1', 'prod1', { name: 'Repo', platform: 'GitHub' });

      expect(result.type).toEqual('error');
      expect(mockedApi.post).not.toHaveBeenCalled();
    });

    it('updateRepository retorna erro quando o token não possui key', async () => {
      mockedGetAccessToken.mockResolvedValueOnce({ type: 'success', value: { key: '' } });

      const result = await repository.updateRepository('org1', 'prod1', 'repo1', { name: 'Repo', platform: 'GitHub' });

      expect(result.type).toEqual('error');
      expect(mockedApi.put).not.toHaveBeenCalled();
    });

    it('deleteRepository retorna erro quando getAccessToken lança', async () => {
      mockedGetAccessToken.mockRejectedValueOnce(new Error('boom'));

      const result = await repository.deleteRepository('org1', 'prod1', 'repo1');

      expect(result.type).toEqual('error');
      expect(mockedApi.delete).not.toHaveBeenCalled();
    });

    it('getHistoricalData retorna erro quando o token está ausente', async () => {
      mockedGetAccessToken.mockResolvedValueOnce({ type: 'error' });

      const result = await repository.getHistoricalData({
        organizationId: 'org1',
        productId: 'prod1',
        repositoryId: 'repo1',
        entity: 'commits'
      });

      expect(result.type).toEqual('error');
      expect(mockedApi.get).not.toHaveBeenCalled();
    });
  });

  describe('caminhos de sucesso', () => {
    it('createRepository retorna sucesso com os dados da resposta', async () => {
      (mockedApi.post as jest.Mock).mockResolvedValue({ data: { id: '1' } });

      const result = await repository.createRepository('org1', 'prod1', { name: 'Repo', platform: 'GitHub' });

      expect(result).toEqual({ type: 'success', value: { id: '1' } });
      expect(mockedApi.post).toHaveBeenCalledWith(
        '/v1/organizations/org1/products/prod1/repositories/',
        { name: 'Repo', platform: 'GitHub', imported: false },
        expect.objectContaining({ headers: expect.anything() })
      );
    });

    it('updateRepository retorna sucesso e usa a URL versionada', async () => {
      (mockedApi.put as jest.Mock).mockResolvedValue({ data: { id: '1' } });

      const result = await repository.updateRepository('org1', 'prod1', 'repo1', { name: 'Repo', platform: 'GitHub' });

      expect(result).toEqual({ type: 'success', value: { id: '1' } });
      expect(mockedApi.put).toHaveBeenCalledWith(
        REPO1_PATH,
        expect.any(Object),
        expect.any(Object)
      );
    });

    it('deleteRepository retorna sucesso com value undefined', async () => {
      (mockedApi.delete as jest.Mock).mockResolvedValue({});

      const result = await repository.deleteRepository('org1', 'prod1', 'repo1');

      expect(result).toEqual({ type: 'success', value: undefined });
      expect(mockedApi.delete).toHaveBeenCalledWith(
        REPO1_PATH,
        expect.any(Object)
      );
    });

    it('getHistoricalData retorna sucesso com os dados da resposta', async () => {
      (mockedApi.get as jest.Mock).mockResolvedValue({ data: [1, 2, 3] });

      const result = await repository.getHistoricalData({
        organizationId: 'org1',
        productId: 'prod1',
        repositoryId: 'repo1',
        entity: 'commits'
      });

      expect(result).toEqual({ type: 'success', value: [1, 2, 3] });
    });
  });

  describe('erros do tipo AxiosError', () => {
    const axiosError = { isAxiosError: true, message: 'boom' };

    it('createRepository propaga o AxiosError', async () => {
      (mockedApi.post as jest.Mock).mockRejectedValue(axiosError);

      const result = await repository.createRepository('org1', 'prod1', { name: 'Repo', platform: 'GitHub' });

      expect(result).toEqual({ type: 'error', error: axiosError });
    });

    it('updateRepository propaga o AxiosError', async () => {
      (mockedApi.put as jest.Mock).mockRejectedValue(axiosError);

      const result = await repository.updateRepository('org1', 'prod1', 'repo1', { name: 'Repo', platform: 'GitHub' });

      expect(result).toEqual({ type: 'error', error: axiosError });
    });

    it('deleteRepository propaga o AxiosError', async () => {
      (mockedApi.delete as jest.Mock).mockRejectedValue(axiosError);

      const result = await repository.deleteRepository('org1', 'prod1', 'repo1');

      expect(result).toEqual({ type: 'error', error: axiosError });
    });

    it('getHistoricalData propaga o AxiosError', async () => {
      (mockedApi.get as jest.Mock).mockRejectedValue(axiosError);

      const result = await repository.getHistoricalData({
        organizationId: 'org1',
        productId: 'prod1',
        repositoryId: 'repo1',
        entity: 'commits'
      });

      expect(result).toEqual({ type: 'error', error: axiosError });
    });
  });

  describe('rotas de leitura e badges', () => {
    const props = { organizationId: 'org1', productId: 'prod1', repositoryId: 'repo1', entity: 'tsqmi' };

    it('getHistorical chama api.get com a URL versionada', async () => {
      (mockedApi.get as jest.Mock).mockResolvedValue({ data: {} });

      await repository.getHistorical(props);

      expect(mockedApi.get).toHaveBeenCalledWith(
        '/v1/organizations/org1/products/prod1/repositories/repo1/historical-values/tsqmi/'
      );
    });

    it('getLatest retorna os dados em caso de sucesso', async () => {
      (mockedApi.get as jest.Mock).mockResolvedValue({ data: { value: 1 } });

      const result = await repository.getLatest(props);

      expect(result).toEqual({ data: { value: 1 } });
      expect(mockedApi.get).toHaveBeenCalledWith(
        '/v1/organizations/org1/products/prod1/repositories/repo1/latest-values/tsqmi/'
      );
    });

    it('getLatest retorna undefined em caso de erro', async () => {
      (mockedApi.get as jest.Mock).mockRejectedValue(new Error('boom'));

      const result = await repository.getLatest(props);

      expect(result).toBeUndefined();
    });

    it('getTsqmiBadgeUrl monta a URL do badge de TSQMI', () => {
      const url = repository.getTsqmiBadgeUrl(props);

      expect(url).toEqual('http://api.test/v1/organizations/org1/products/prod1/repositories/repo1/latest-values/tsqmi/badge');
    });

    it('getCharacteristicBadgeUrl monta a URL do badge de característica', () => {
      const url = repository.getCharacteristicBadgeUrl('org1', 'prod1', 'repo1', 'reliability');

      expect(url).toEqual(
        'http://api.test/v1/organizations/org1/products/prod1/repositories/repo1/latest-values/characteristics/reliability/badge/'
      );
    });
  });
});

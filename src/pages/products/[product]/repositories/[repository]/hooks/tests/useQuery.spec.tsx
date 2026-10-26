import { renderHook, waitFor } from '@testing-library/react';

import { repository } from '@services/repository';
import { productQuery } from '@services/product';

import { useQuery } from '../useQuery';

// ---- Estado mutável compartilhado pelos mocks ----
const mockSetters = {
  setCurrentRepository: jest.fn(),
  setLatestTSQMI: jest.fn(),
  setLatestTSQMIBadgeUrl: jest.fn()
};

const mockSetCurrentProduct = jest.fn();
const mockSetCurrentOrganizations = jest.fn();

let mockQuery: Record<string, string | undefined> = {};
let mockCurrentProduct: any = null;
let mockCurrentOrganization: any = null;
let mockOrganizationList: any[] = [];

const BADGE_URL = 'http://badge.url';

// ---- Mocks do Next e Contextos ----
jest.mock('next/router', () => ({
  useRouter: () => ({ query: mockQuery, push: jest.fn() })
}));

jest.mock('@contexts/RepositoryProvider', () => ({
  useRepositoryContext: () => mockSetters
}));

jest.mock('@contexts/ProductProvider', () => ({
  useProductContext: () => ({
    setCurrentProduct: mockSetCurrentProduct,
    currentProduct: mockCurrentProduct
  })
}));

jest.mock('@contexts/OrganizationProvider', () => ({
  useOrganizationContext: () => ({
    currentOrganization: mockCurrentOrganization,
    organizationList: mockOrganizationList,
    setCurrentOrganizations: mockSetCurrentOrganizations
  })
}));

// ---- Mocks dos Serviços ----
jest.mock('@services/repository', () => ({
  repository: {
    getHistorical: jest.fn(),
    getLatest: jest.fn(),
    getTsqmiBadgeUrl: jest.fn(),
    getRepository: jest.fn(),
    getCharacteristicBadgeUrl: jest.fn()
  }
}));

jest.mock('@services/product', () => ({
  productQuery: {
    getPreConfigEntitiesRelationship: jest.fn(),
    getMetricsLatestValues: jest.fn(),
    getCharacteristicsLatestValues: jest.fn(),
    getCompareGoalAccomplished: jest.fn(),
    getProductById: jest.fn()
  }
}));

// ---- Mocks dos Utilitários ----
jest.mock('@utils/pathDestructer', () => ({
  getPathId: jest.fn((str: string) => (str ? str.split('-') : []))
}));

const mockedRepository = repository as jest.Mocked<typeof repository>;
const mockedProductQuery = productQuery as jest.Mocked<typeof productQuery>;

describe('useQuery', () => {
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeAll(() => {
    // Mantém o console limpo durante os testes de "caminho triste".
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Reseta o estado dos contextos.
    mockQuery = {};
    mockCurrentProduct = null;
    mockCurrentOrganization = null;
    mockOrganizationList = [];

    // Retornos padrão (caminho feliz) que cada teste pode sobrescrever.
    mockedProductQuery.getPreConfigEntitiesRelationship.mockResolvedValue({ data: { data: [] } });
    mockedProductQuery.getMetricsLatestValues.mockResolvedValue({ data: {} });
    mockedProductQuery.getCharacteristicsLatestValues.mockResolvedValue({ data: [] });
    mockedProductQuery.getCompareGoalAccomplished.mockResolvedValue({ data: [] });
    mockedProductQuery.getProductById.mockResolvedValue({ type: 'success', value: { id: '2', name: 'TestProduct' } });

    mockedRepository.getHistorical.mockResolvedValue({ data: { results: [] } });
    mockedRepository.getLatest.mockResolvedValue({ data: {} });
    mockedRepository.getRepository.mockResolvedValue({ data: { id: '1', name: 'test-repo' } });
    mockedRepository.getTsqmiBadgeUrl.mockReturnValue(BADGE_URL);
    mockedRepository.getCharacteristicBadgeUrl.mockReturnValue('http://char-badge.url');
  });

  describe('fluxo de dados (sucesso e erros)', () => {
    it('não deve acionar as requisições se não houver um repositório na query', () => {
      mockQuery = {};

      renderHook(() => useQuery());

      expect(mockedRepository.getRepository).not.toHaveBeenCalled();
    });

    it('busca o repositório e o último TSQMI com o badge quando há repositório na query', async () => {
      mockQuery = { product: 'org-1-prod-2', repository: 'repo-3' };
      mockedRepository.getLatest.mockResolvedValue({ data: 'latestTsqmi' });
      mockedRepository.getRepository.mockResolvedValue({ data: 'repositoryData' });

      renderHook(() => useQuery());

      await waitFor(() => {
        expect(mockSetters.setCurrentRepository).toHaveBeenCalledWith('repositoryData');
        expect(mockSetters.setLatestTSQMI).toHaveBeenCalledWith('latestTsqmi');
        expect(mockSetters.setLatestTSQMIBadgeUrl).toHaveBeenCalledWith(BADGE_URL);
      });
    });

    it('não pede os dados dos componentes que a tela não usa mais', async () => {
      mockQuery = { product: 'org-1-prod-2', repository: 'repo-3' };

      renderHook(() => useQuery());

      await waitFor(() => expect(mockSetters.setLatestTSQMIBadgeUrl).toHaveBeenCalledWith(BADGE_URL));
      expect(mockedProductQuery.getPreConfigEntitiesRelationship).not.toHaveBeenCalled();
      expect(mockedProductQuery.getMetricsLatestValues).not.toHaveBeenCalled();
      expect(mockedProductQuery.getCharacteristicsLatestValues).not.toHaveBeenCalled();
      expect(mockedProductQuery.getCompareGoalAccomplished).not.toHaveBeenCalled();
      expect(mockedRepository.getHistorical).not.toHaveBeenCalled();
    });

    it('não busca de novo o produto que o Layout já carregou', async () => {
      mockQuery = { product: '1-2', repository: '3-test' };
      mockCurrentProduct = { id: 2, name: 'Produto' };

      renderHook(() => useQuery());

      await waitFor(() => expect(mockSetters.setCurrentRepository).toHaveBeenCalledWith({ id: '1', name: 'test-repo' }));
      expect(mockedProductQuery.getProductById).not.toHaveBeenCalled();
    });

    it('deve lidar corretamente com erros nas requisições sem quebrar a aplicação (blocos catch)', async () => {
      mockQuery = { product: 'org-1-prod-2', repository: 'repo-3' };

      const error = new Error('Network Error');
      mockedProductQuery.getProductById.mockRejectedValue(error);

      mockedRepository.getLatest.mockRejectedValue(error);
      mockedRepository.getRepository.mockRejectedValue(error);

      renderHook(() => useQuery());

      await waitFor(() => {
        // O catch do loadLatestTsqmi chama console.log.
        expect(logSpy).toHaveBeenCalledWith(error);
        // O catch do loadProduct chama console.error.
        expect(errorSpy).toHaveBeenCalledWith(error);
        // A limpeza inicial do estado roda sem quebrar mesmo diante dos erros.
        expect(mockSetters.setLatestTSQMI).toHaveBeenCalledWith(undefined);
        // Como getRepository falhou, o repositório nunca recebe dados reais.
        expect(mockSetters.setCurrentRepository).not.toHaveBeenCalledWith('repositoryData');
      });
    });
  });

  describe('organização e badges', () => {
    it('should load repository data when query.repository is present', async () => {
      mockQuery = { product: '1-2', repository: '3-test' };

      renderHook(() => useQuery());

      await waitFor(() => {
        expect(mockSetCurrentProduct).toHaveBeenCalled();
      });
    });

    it('should synchronize organization when query.product is present and org list is loaded', async () => {
      mockOrganizationList = [
        { id: '1', name: 'Org 1' },
        { id: '5', name: 'Org 5' }
      ];
      mockCurrentOrganization = null;
      mockQuery = { product: '5-2' };

      renderHook(() => useQuery());

      await waitFor(() => {
        expect(mockSetCurrentOrganizations).toHaveBeenCalledWith([{ id: '5', name: 'Org 5' }]);
      });
    });

    it('should not set organization when current org already matches', async () => {
      mockOrganizationList = [{ id: '1', name: 'Org 1' }];
      mockCurrentOrganization = { id: '1', name: 'Org 1' };
      mockQuery = { product: '1-2' };

      renderHook(() => useQuery());

      await waitFor(() => {
        expect(mockSetCurrentOrganizations).not.toHaveBeenCalled();
      });
    });

    it('should reload product when currentProduct becomes null after org change', async () => {
      mockCurrentOrganization = { id: '1', name: 'Org 1' };
      mockCurrentProduct = null;
      mockQuery = { product: '1-2' };

      renderHook(() => useQuery());

      await waitFor(() => {
        expect(mockedProductQuery.getProductById).toHaveBeenCalledWith('1', '2');
      });
    });

    it('should call loadProduct when repository query changes', async () => {
      mockQuery = { product: '10-20', repository: '30-test' };

      renderHook(() => useQuery());

      await waitFor(() => {
        expect(mockedProductQuery.getProductById).toHaveBeenCalledWith('10', '20');
      });
    });

    it('should clear repository-scoped badge state when query.repository changes', async () => {
      mockQuery = { product: '1-2', repository: '3-test' };

      renderHook(() => useQuery());

      await waitFor(() => {
        expect(mockSetters.setCurrentRepository).toHaveBeenCalledWith(undefined);
        expect(mockSetters.setLatestTSQMI).toHaveBeenCalledWith(undefined);
        expect(mockSetters.setLatestTSQMIBadgeUrl).toHaveBeenCalledWith(undefined);
      });
    });

    it('should handle loadProduct error gracefully', async () => {
      mockedProductQuery.getProductById.mockRejectedValueOnce(new Error('Network error'));

      mockQuery = { product: '1-2', repository: '3-test' };

      renderHook(() => useQuery());

      await waitFor(() => {
        expect(errorSpy).toHaveBeenCalled();
      });
      expect(mockSetCurrentProduct).not.toHaveBeenCalled();
    });
  });
});

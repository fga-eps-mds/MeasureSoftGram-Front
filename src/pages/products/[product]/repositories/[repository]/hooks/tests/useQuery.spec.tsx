import { renderHook, waitFor } from '@testing-library/react';

import { repository } from '@services/repository';
import { productQuery } from '@services/product';

import formatEntitiesFilter from '@utils/formatEntitiesFilter';
import formatEntitiesMetrics from '@utils/formatEntitiesMetrics';

import { useQuery } from '../useQuery';

// ---- Estado mutável compartilhado pelos mocks ----
const mockSetters = {
  setCurrentRepository: jest.fn(),
  setCharacteristics: jest.fn(),
  setSubCharacteristics: jest.fn(),
  setMeasures: jest.fn(),
  setMetrics: jest.fn(),
  setHistoricalTSQMI: jest.fn(),
  setLatestTSQMI: jest.fn(),
  setLatestTSQMIBadgeUrl: jest.fn(),
  setCharacteristicBadgeUrls: jest.fn()
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
jest.mock('@utils/formatEntitiesFilter', () => jest.fn());
jest.mock('@utils/formatEntitiesMetrics', () => jest.fn());
jest.mock('@utils/pathDestructer', () => ({
  getPathId: jest.fn((str: string) => (str ? str.split('-') : []))
}));

const mockedRepository = repository as jest.Mocked<typeof repository>;
const mockedProductQuery = productQuery as jest.Mocked<typeof productQuery>;
const mockedFormatEntitiesFilter = formatEntitiesFilter as jest.Mock;
const mockedFormatEntitiesMetrics = formatEntitiesMetrics as jest.Mock;

describe('useQuery', () => {
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeAll(() => {
    // window.crypto é usado em loadHistoricalTsqmi/loadLatestTsqmi.
    Object.defineProperty(window, 'crypto', {
      configurable: true,
      value: {
        getRandomValues: jest.fn((arr: Uint32Array) => {
          const randomValues = new Uint32Array(arr);
          randomValues[0] = 12345;
          return randomValues;
        })
      }
    });

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
    mockedFormatEntitiesFilter.mockReturnValue([[], [], []]);
    mockedFormatEntitiesMetrics.mockReturnValue([[]]);

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

    it('deve buscar e formatar todos os dados com sucesso quando houver repositório na query', async () => {
      mockQuery = { product: 'org-1-prod-2', repository: 'repo-3' };
      mockCurrentOrganization = { id: 'org' };
      mockOrganizationList = [{ id: 'org' }];

      mockedFormatEntitiesFilter.mockReturnValue([['char1'], ['sub1'], ['meas1']]);
      mockedFormatEntitiesMetrics.mockReturnValue([['met1']]);

      mockedProductQuery.getPreConfigEntitiesRelationship.mockResolvedValue({ data: 'rel' });
      mockedProductQuery.getMetricsLatestValues.mockResolvedValue({ data: 'metrics' });
      mockedProductQuery.getCharacteristicsLatestValues.mockResolvedValue({ data: ['charData'] });
      mockedProductQuery.getCompareGoalAccomplished.mockResolvedValue({ data: ['goalAccomplished'] });
      mockedProductQuery.getProductById.mockResolvedValue({ type: 'success', value: 'productData' });

      mockedRepository.getHistorical.mockResolvedValue({ data: { results: ['historicalData'] } });
      mockedRepository.getLatest.mockResolvedValue({ data: 'latestTsqmi' });
      mockedRepository.getTsqmiBadgeUrl.mockReturnValue(BADGE_URL);
      mockedRepository.getRepository.mockResolvedValue({ data: 'repositoryData' });

      const { result } = renderHook(() => useQuery());

      await waitFor(() => {
        expect(mockSetters.setCurrentRepository).toHaveBeenCalledWith('repositoryData');
        expect(mockSetters.setCharacteristics).toHaveBeenCalledWith(['char1']);
        expect(mockSetters.setSubCharacteristics).toHaveBeenCalledWith(['sub1']);
        expect(mockSetters.setMeasures).toHaveBeenCalledWith(['meas1']);
        expect(mockSetters.setMetrics).toHaveBeenCalledWith(['met1']);
        expect(mockSetters.setLatestTSQMI).toHaveBeenCalledWith('latestTsqmi');
        expect(mockSetters.setLatestTSQMIBadgeUrl).toHaveBeenCalledWith(BADGE_URL);
        expect(mockSetters.setHistoricalTSQMI).toHaveBeenCalledWith(
          expect.objectContaining({ name: 'TSQMI', key: 'TSQMI', history: ['historicalData'] })
        );

        expect(result.current.repositoryHistoricalCharacteristics).toEqual(['historicalData']);
        expect(result.current.latestValueCharacteristics).toEqual(['charData']);
        expect(result.current.comparedGoalAccomplished).toEqual(['goalAccomplished']);

        expect(result.current.checkedOptionsFormat).toEqual({
          char1: true,
          sub1: true,
          meas1: true,
          met1: true
        });
      });
    });

    it('deve lidar corretamente com erros nas requisições sem quebrar a aplicação (blocos catch)', async () => {
      mockQuery = { product: 'org-1-prod-2', repository: 'repo-3' };

      const error = new Error('Network Error');
      mockedProductQuery.getPreConfigEntitiesRelationship.mockRejectedValue(error);
      mockedProductQuery.getCharacteristicsLatestValues.mockRejectedValue(error);
      mockedProductQuery.getCompareGoalAccomplished.mockRejectedValue(error);
      mockedProductQuery.getProductById.mockRejectedValue(error);

      mockedRepository.getHistorical.mockRejectedValue(error);
      mockedRepository.getLatest.mockRejectedValue(error);
      mockedRepository.getRepository.mockRejectedValue(error);

      renderHook(() => useQuery());

      await waitFor(() => {
        // O catch do loadLatestTsqmi chama console.log.
        expect(logSpy).toHaveBeenCalledWith(error);
        // Os catches de loadCompareGoalAccomplished e loadProduct chamam console.error.
        expect(errorSpy).toHaveBeenCalledWith(error);
        // A limpeza inicial do estado roda sem quebrar mesmo diante dos erros.
        expect(mockSetters.setCharacteristicBadgeUrls).toHaveBeenCalledWith({});
        // Como getRepository falhou, o repositório nunca recebe dados reais.
        expect(mockSetters.setCurrentRepository).not.toHaveBeenCalledWith('repositoryData');
      });
    });
  });

  describe('organização e badges', () => {
    it('should return initial state when no query params', () => {
      const { result } = renderHook(() => useQuery());

      expect(result.current.repositoryHistoricalCharacteristics).toEqual([]);
      expect(result.current.latestValueCharacteristics).toEqual([]);
      expect(result.current.comparedGoalAccomplished).toEqual([]);
    });

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
        expect(mockSetters.setCharacteristicBadgeUrls).toHaveBeenCalledWith({});
        expect(mockSetters.setLatestTSQMI).toHaveBeenCalledWith(undefined);
        expect(mockSetters.setLatestTSQMIBadgeUrl).toHaveBeenCalledWith(undefined);
      });
    });

    it('should handle loadProduct error gracefully', async () => {
      mockedProductQuery.getProductById.mockRejectedValueOnce(new Error('Network error'));

      mockQuery = { product: '1-2', repository: '3-test' };

      const { result } = renderHook(() => useQuery());

      await waitFor(() => {
        expect(result.current.repositoryHistoricalCharacteristics).toEqual([]);
      });
    });
  });
});

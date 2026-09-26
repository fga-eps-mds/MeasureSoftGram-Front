import { renderHook } from '@testing-library/react';
import { useProductContext } from '@contexts/ProductProvider';
import { useRepositoryContext } from '@contexts/RepositoryProvider';
import { productQuery } from '@services/product';
import { repository } from '@services/repository';
import { useRouter } from 'next/router';
import { useQuery } from '../useQuery';

// Mocks dos contextos e serviços
jest.mock('@contexts/ProductProvider');
jest.mock('@contexts/RepositoryProvider');
jest.mock('@services/product');
jest.mock('@services/repository');
jest.mock('next/router', () => ({ useRouter: jest.fn() }));

describe('useQuery Hook', () => {
  const mockSetRepositoryList = jest.fn();
  const mockSetCurrentProduct = jest.fn();

  beforeEach(() => {
    (useRepositoryContext as jest.Mock).mockReturnValue({ setRepositoryList: mockSetRepositoryList });
    (useProductContext as jest.Mock).mockReturnValue({ 
      currentProduct: { id: '1' }, 
      setCurrentProduct: mockSetCurrentProduct 
    });
    (useRouter as jest.Mock).mockReturnValue({ query: {} });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve carregar o produto corretamente', async () => {
    const mockProduct = { value: { id: '2', name: 'Novo Produto' } };
    (productQuery.getProductById as jest.Mock).mockResolvedValue(mockProduct);

    const { result } = renderHook(() => useQuery());
    
    await result.current.loadProduct('org1', '2');
    
    expect(mockSetCurrentProduct).toHaveBeenCalledWith(mockProduct.value);
  });

  it('deve lidar com falha no loadProduct', async () => {
    (productQuery.getProductById as jest.Mock).mockRejectedValue(new Error('Erro'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useQuery());
    await result.current.loadProduct('org1', '2');
    
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('deve executar a criação de repositório via handleRepositoryAction', async () => {
    const mockResponse = { type: 'success' };
    (repository.createRepository as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useQuery());
    const response = await result.current.handleRepositoryAction('create', 'org1', 'prod1', undefined, {});

    expect(response).toEqual(mockResponse);
    expect(repository.createRepository).toHaveBeenCalled();
  });

  it('deve retornar erro se a ação for inválida no handleRepositoryAction', async () => {
    const { result } = renderHook(() => useQuery());
    const response = await result.current.handleRepositoryAction('invalid', 'org1', 'prod1', 'rep1', {});

    expect(response.type).toBe('error');
  });
});

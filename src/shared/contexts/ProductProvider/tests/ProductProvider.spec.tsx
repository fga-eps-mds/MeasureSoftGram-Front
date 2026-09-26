import React from 'react';
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react';
import { productQuery } from '@services/product';
import * as OrgContext from '@contexts/OrganizationProvider';
import * as LocalStorageHook from '@hooks/useLocalStorage';
import { ProductProvider, useProductContext } from '../ProductProvider';

jest.mock('@services/product');
jest.mock('@contexts/OrganizationProvider');
jest.mock('@hooks/useLocalStorage');

describe('ProductProvider', () => {
  let mockSetValue: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetValue = jest.fn();
    (LocalStorageHook.useLocalStorage as jest.Mock).mockReturnValue({
      storedValue: null,
      setValue: mockSetValue,
      removeValue: jest.fn()
    });
  });

  it('renders correctly and loads data', async () => {
    jest.spyOn(OrgContext, 'useOrganizationContext').mockReturnValue({
      currentOrganization: { id: 'org-1' }
    } as any);

    (productQuery.getAllProducts as jest.Mock).mockResolvedValueOnce({
      data: {
        results: [{ id: 'prod-1', name: 'Prod 1' }]
      }
    });

    const Child = () => {
      const { productsList, currentProduct } = useProductContext();
      return (
        <div>
          <span data-testid="prod-len">{productsList?.length || 0}</span>
          <span data-testid="curr-prod">{currentProduct?.name || 'none'}</span>
        </div>
      );
    };

    render(
      <ProductProvider>
        <Child />
      </ProductProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('curr-prod').textContent).toBe('Prod 1');
    });
  });

  it('handles null organization', async () => {
    jest.spyOn(OrgContext, 'useOrganizationContext').mockReturnValue({
      currentOrganization: null
    } as any);

    const Child = () => {
      const { productsList, currentProduct, loadAllProducts } = useProductContext();
      return (
        <div>
          <span data-testid="prod-len">{productsList?.length || 0}</span>
          <span data-testid="curr-prod">{currentProduct?.name || 'none'}</span>
          <button onClick={loadAllProducts}>Load</button>
        </div>
      );
    };

    render(
      <ProductProvider>
        <Child />
      </ProductProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByText('Load'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('prod-len').textContent).toBe('0');
      expect(screen.getByTestId('curr-prod').textContent).toBe('none');
    });
  });

  it('updates state via setters', async () => {
    jest.spyOn(OrgContext, 'useOrganizationContext').mockReturnValue({
      currentOrganization: { id: 'org-1' }
    } as any);

    const Child = () => {
      const { setCurrentProduct, updateProductList, currentProduct } = useProductContext();
      return (
        <div>
          <span data-testid="curr-prod">{currentProduct?.name || 'none'}</span>
          <button onClick={() => updateProductList([{ id: 'prod-2', name: 'Prod 2', description: '', github_id: 1 }])}>Update List</button>
          <button onClick={() => setCurrentProduct({ id: 'prod-3', name: 'Prod 3', description: '', github_id: 2 })}>Set Curr</button>
        </div>
      );
    };

    render(
      <ProductProvider>
        <Child />
      </ProductProvider>
    );

    act(() => {
      screen.getByText('Update List').click();
    });

    expect(screen.getByTestId('curr-prod').textContent).toBe('Prod 2');

    act(() => {
      screen.getByText('Set Curr').click();
    });

    expect(screen.getByTestId('curr-prod').textContent).toBe('Prod 3');
  });
  
  it('handles api error', async () => {
    jest.spyOn(OrgContext, 'useOrganizationContext').mockReturnValue({
      currentOrganization: { id: 'org-1' }
    } as any);

    (productQuery.getAllProducts as jest.Mock).mockRejectedValueOnce(new Error('api err'));

    render(
      <ProductProvider>
        <div />
      </ProductProvider>
    );
    
    await waitFor(() => {
      expect(productQuery.getAllProducts).toHaveBeenCalled();
    });
  });

  it('loads from local storage', async () => {
    (LocalStorageHook.useLocalStorage as jest.Mock).mockReturnValue({
      storedValue: 'prod-2',
      setValue: mockSetValue,
      removeValue: jest.fn()
    });

    jest.spyOn(OrgContext, 'useOrganizationContext').mockReturnValue({
      currentOrganization: { id: 'org-1' }
    } as any);

    (productQuery.getAllProducts as jest.Mock).mockResolvedValueOnce({
      data: {
        results: [{ id: 'prod-1', name: 'Prod 1' }, { id: 'prod-2', name: 'Prod 2' }]
      }
    });

    const Child = () => {
      const { currentProduct } = useProductContext();
      return (
        <div>
          <span data-testid="curr-prod">{currentProduct?.name || 'none'}</span>
        </div>
      );
    };

    render(
      <ProductProvider>
        <Child />
      </ProductProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('curr-prod').textContent).toBe('Prod 2');
    });
  });

  it('throws error if used outside provider', () => {
    const Child = () => {
      useProductContext();
      return <div />;
    };
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Child />)).toThrow('useProductContext must be used within a ProductContext');
    consoleSpy.mockRestore();
  });
});

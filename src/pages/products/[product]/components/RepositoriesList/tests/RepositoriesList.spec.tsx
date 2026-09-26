import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/router';
import RepositoriesList from '../RepositoriesList';

jest.mock('next/router', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn().mockReturnValue({
      catch: jest.fn()
    })
  })
}));

jest.mock('@contexts/RepositoryProvider', () => ({
  useRepositoryContext: jest.fn(() => ({
    repositoryList: [
      { id: 1, name: 'Repository 1' },
      { id: 2, name: 'Repository 2' },
      { id: 3, name: 'Repository 3' }
    ]
  }))
}));

jest.mock('@contexts/ProductProvider', () => ({
  useProductContext: jest.fn(() => ({
    currentProduct: { id: 2, name: 'Product' }
  }))
}));

jest.mock('@contexts/OrganizationProvider', () => ({
  useOrganizationContext: jest.fn(() => ({
    currentOrganization: { id: 1, name: 'Organization' }
  }))
}));

describe('RepositoriesList', () => {
  test('Navega para a página de repositórios quando clica em VER MAIS', () => {
    render(<RepositoriesList />);
    const buttonElement = screen.getByTestId('button-ver-mais');
    fireEvent.click(buttonElement);
    const mockRouterPush = useRouter().push;
    expect(mockRouterPush).toHaveBeenCalledTimes(1);
    expect(mockRouterPush).toHaveBeenCalledWith('/products/1-2-Product/repositories');
  });
});

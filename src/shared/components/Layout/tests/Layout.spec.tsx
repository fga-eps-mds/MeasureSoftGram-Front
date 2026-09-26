import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RepositoryProvider } from '@contexts/RepositoryProvider';
import { useProductContext } from '@contexts/ProductProvider';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import Layout from '../Layout';

const mockLogout = jest.fn();
const mockPush = jest.fn();

jest.mock('@contexts/Auth', () => ({
  useAuth: () => ({
    session: { username: 'testuser' },
    logout: mockLogout,
  }),
}));

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    asPath: '/home',
  }),
}));

jest.mock('@contexts/ProductProvider', () => ({
  useProductContext: jest.fn(),
}));

jest.mock('@contexts/OrganizationProvider', () => ({
  OrganizationProvider: ({ children }: any) => children,
  useOrganizationContext: jest.fn(),
}));

describe('<Layout />', () => {
  const mockUseProductContext = useProductContext as jest.Mock;
  const mockUseOrganizationContext = useOrganizationContext as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Snapshot', () => {
    it('Deve corresponder ao Snapshot sem produtos (sidebar oculta)', () => {
      mockUseProductContext.mockReturnValue({
        productsList: [],
        currentProduct: null,
        setCurrentProduct: jest.fn(),
        updateProductList: jest.fn(),
      });

      mockUseOrganizationContext.mockReturnValue({
        organizationList: [],
        currentOrganization: null,
        setCurrentOrganizations: jest.fn(),
        fetchOrganizations: jest.fn(),
      });

      const tree = render(
        <RepositoryProvider>
          <Layout />
        </RepositoryProvider>
      );
      expect(tree).toMatchSnapshot();
    });

    it('Deve corresponder ao Snapshot com produtos (sidebar visível)', () => {
      mockUseProductContext.mockReturnValue({
        productsList: [{ id: '1', name: 'Product 1' }],
        currentProduct: { id: '1', name: 'Product 1' },
        setCurrentProduct: jest.fn(),
        updateProductList: jest.fn(),
      });

      mockUseOrganizationContext.mockReturnValue({
        organizationList: [{ id: '1', name: 'Org 1', products: ['1'] }],
        currentOrganization: { id: '1', name: 'Org 1', products: ['1'] },
        setCurrentOrganizations: jest.fn(),
        fetchOrganizations: jest.fn(),
      });

      const tree = render(
        <RepositoryProvider>
          <Layout />
        </RepositoryProvider>
      );
      expect(tree).toMatchSnapshot();
    });

    it('Deve renderizar com sidebar visível se productsList estiver vazia mas organizationList contiver produtos', () => {
      mockUseProductContext.mockReturnValue({
        productsList: [],
        currentProduct: null,
        setCurrentProduct: jest.fn(),
        updateProductList: jest.fn(),
      });

      mockUseOrganizationContext.mockReturnValue({
        organizationList: [{ id: '1', name: 'Org 1', products: ['1'] }],
        currentOrganization: { id: '1', name: 'Org 1', products: ['1'] },
        setCurrentOrganizations: jest.fn(),
        fetchOrganizations: jest.fn(),
      });

      const tree = render(
        <RepositoryProvider>
          <Layout />
        </RepositoryProvider>
      );
      expect(tree).toBeDefined();
      expect(screen.queryByAltText('MeasureSoftGram')).toBeNull();
    });
  });

  describe('User Menu Interactions', () => {
    beforeEach(() => {
      mockUseProductContext.mockReturnValue({
        productsList: [],
        currentProduct: null,
        setCurrentProduct: jest.fn(),
        updateProductList: jest.fn(),
      });

      mockUseOrganizationContext.mockReturnValue({
        organizationList: [],
        currentOrganization: null,
        setCurrentOrganizations: jest.fn(),
        fetchOrganizations: jest.fn(),
      });
    });

    it('deve abrir o menu do usuário e navegar para as configurações', async () => {
      render(
        <RepositoryProvider>
          <Layout />
        </RepositoryProvider>
      );

      const userButton = screen.getByRole('button', { name: /testuser/i });
      fireEvent.click(userButton);

      const configMenuItem = screen.getByText('select.config');
      fireEvent.click(configMenuItem);

      expect(mockPush).toHaveBeenCalledWith('/config');
    });

    it('deve fazer logout ao clicar no botão de sair', async () => {
      render(
        <RepositoryProvider>
          <Layout />
        </RepositoryProvider>
      );

      const userButton = screen.getByRole('button', { name: /testuser/i });
      fireEvent.click(userButton);

      const logoutMenuItem = screen.getByText('select.end-session');
      fireEvent.click(logoutMenuItem);

      expect(mockLogout).toHaveBeenCalled();
    });
  });
});

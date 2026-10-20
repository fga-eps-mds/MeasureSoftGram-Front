import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SideMenu from '../SideMenu';

const mockPush = jest.fn();

jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/products/[product]',
    query: { product: '1-5-MeasureSoftGram' },
    push: mockPush,
  }),
}));

jest.mock('@contexts/Auth', () => ({
  useAuth: () => ({ session: { username: 'testuser' } }),
}));

jest.mock('@contexts/OrganizationProvider', () => ({
  useOrganizationContext: () => ({
    currentOrganization: { id: '1', name: 'org-test' },
  }),
}));

jest.mock('@contexts/ProductProvider', () => ({
  useProductContext: () => ({
    currentProduct: { id: '5', name: 'MeasureSoftGram' },
  }),
}));

jest.mock('@contexts/SidebarProvider/SideMenuProvider', () => ({
  useSideMenuContext: () => ({ isCollapsed: false }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'pt', changeLanguage: jest.fn() },
  }),
}));

jest.mock('@hooks/useProviderTranslation', () => ({
  useProviderTranslation: () => ({
    t: (key: string) => {
      if (key.includes('overview.text')) return 'Visão Geral';
      if (key.includes('repos.text')) return 'Repositórios';
      return key;
    },
    i18n: { language: 'pt', changeLanguage: jest.fn() },
  }),
}));

describe('SideMenu Dashboards Submenu (CA1)', () => {
  it('exibe o item "3. Metamodelo" ao expandir o menu Dashboards e navega ao clicar nele', () => {
    render(<SideMenu />);

    const dashboardsButton = screen.getByText('Dashboards');
    expect(dashboardsButton).toBeInTheDocument();

    // Clica para expandir o submenu Dashboards
    fireEvent.click(dashboardsButton);

    const metamodeloItem = screen.getByText('3. Metamodelo');
    expect(metamodeloItem).toBeInTheDocument();

    fireEvent.click(metamodeloItem);
    expect(mockPush).toHaveBeenCalledWith('/products/1-5-MeasureSoftGram/dashboards/metamodelo');
  });
});

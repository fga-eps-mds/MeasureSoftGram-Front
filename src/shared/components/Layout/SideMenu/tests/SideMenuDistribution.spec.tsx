import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SideMenu from '../SideMenu';

const mockPush = jest.fn();

jest.mock('../SideMenuWrapper', () => ({
  __esModule: true,
  default: ({ menuItems }: { menuItems?: React.ReactNode }) => <nav>{menuItems}</nav>
}));
jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/products/[product]',
    query: { product: '1-5-MeasureSoftGram' },
    push: mockPush
  })
}));
jest.mock('@contexts/Auth', () => ({
  useAuth: () => ({ session: { username: 'testuser' } })
}));
jest.mock('@contexts/OrganizationProvider', () => ({
  useOrganizationContext: () => ({ currentOrganization: { id: '1', name: 'org-test' } })
}));
jest.mock('@contexts/ProductProvider', () => ({
  useProductContext: () => ({ currentProduct: { id: '5', name: 'MeasureSoftGram' } })
}));
jest.mock('@contexts/SidebarProvider/SideMenuProvider', () => ({
  useSideMenuContext: () => ({ isCollapsed: false, closeOverlay: jest.fn() })
}));
jest.mock('@hooks/useProviderTranslation', () => ({
  useProviderTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'pt', changeLanguage: jest.fn() }
  })
}));

describe('<SideMenu /> · 5. Distribuição Estatística (CA1)', () => {
  it('mostra o item no submenu Dashboards e navega para o dashboard', () => {
    render(<SideMenu />);

    fireEvent.click(screen.getByText('Dashboards'));
    fireEvent.click(screen.getByText('5. Distribuição Estatística'));

    expect(mockPush).toHaveBeenCalledWith('/products/1-5-MeasureSoftGram/dashboards/distribuicao');
  });
});

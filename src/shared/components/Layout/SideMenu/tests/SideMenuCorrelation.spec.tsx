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
  useSideMenuContext: () => ({ isCollapsed: false })
}));
jest.mock('@hooks/useProviderTranslation', () => ({
  useProviderTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'pt', changeLanguage: jest.fn() }
  })
}));

describe('<SideMenu /> · 6. Relações e Correlações (CA1)', () => {
  it('mostra o item no submenu Dashboards e navega para o dashboard', () => {
    render(<SideMenu />);

    fireEvent.click(screen.getByText('Dashboards'));
    fireEvent.click(screen.getByText('6. Relações e Correlações'));

    expect(mockPush).toHaveBeenCalledWith('/products/1-5-MeasureSoftGram/dashboards/relacoes');
  });
});

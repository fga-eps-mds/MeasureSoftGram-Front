import React from 'react';
import { act, render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SideMenu from '../SideMenu';

const mockPush = jest.fn();
const mockPrefetch = jest.fn(() => Promise.resolve());

jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/products/[product]',
    query: { product: '1-5-MeasureSoftGram' },
    push: mockPush,
    prefetch: mockPrefetch,
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
  it('adianta o código das abas do menu e dos dashboards, para a troca de aba não esperar o download', () => {
    jest.useFakeTimers();
    render(<SideMenu />);

    // espera o navegador ficar ocioso (no jsdom, o temporizador de reserva)
    expect(mockPrefetch).not.toHaveBeenCalled();
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();

    const base = '/products/1-5-MeasureSoftGram';
    expect(mockPrefetch.mock.calls.map(([path]) => path)).toEqual([
      base,
      `${base}/repositories`,
      `${base}/releases`,
      `${base}/dashboards/overview`,
      `${base}/dashboards/temporal`,
      `${base}/dashboards/metamodelo`,
      `${base}/dashboards/entidade`,
      `${base}/dashboards/distribuicao`,
      `${base}/dashboards/relacoes`,
    ]);
  });

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

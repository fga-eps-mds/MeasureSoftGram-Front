import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useMediaQuery } from '@mui/material';
import { SideMenuProvider } from '@contexts/SidebarProvider/SideMenuProvider';
import SideMenu from '../SideMenu';

const mockPush = jest.fn();

jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: jest.fn(),
}));

jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/products/[product]',
    query: { product: '1-5-MeasureSoftGram' },
    push: mockPush,
    prefetch: jest.fn(() => Promise.resolve()),
  }),
}));

jest.mock('@contexts/Auth', () => ({
  useAuth: () => ({ session: { username: 'testuser' } }),
}));

jest.mock('@contexts/OrganizationProvider', () => ({
  useOrganizationContext: () => ({ currentOrganization: { id: '1', name: 'org-test' } }),
}));

jest.mock('@contexts/ProductProvider', () => ({
  useProductContext: () => ({ currentProduct: { id: '5', name: 'MeasureSoftGram' } }),
}));

jest.mock('@hooks/useProviderTranslation', () => ({
  useProviderTranslation: () => ({
    t: (key: string) => (key.includes('repos.text') ? 'Repositórios' : key),
    i18n: { language: 'pt' },
  }),
}));

jest.mock('@components/Translation/Translation', () => () => <div>idioma</div>);
jest.mock('../OrganizationSelector', () => () => <div>organização</div>);
jest.mock('../ProductsSelector', () => () => <div>produto</div>);
jest.mock('../UserMenu', () => () => <div>usuário</div>);

const renderMenu = () =>
  render(
    <SideMenuProvider>
      <SideMenu />
    </SideMenuProvider>
  );

const openMenu = () => {
  fireEvent.click(screen.getByTestId('side-menu-collapse'));
  expect(screen.getByTestId('side-menu')).toHaveStyle({ position: 'fixed' });
  expect(screen.getByTestId('side-menu-backdrop')).toBeInTheDocument();
};

const expectClosed = () => {
  expect(screen.getByTestId('side-menu')).toHaveStyle({ position: 'sticky' });
  expect(screen.queryByTestId('side-menu-backdrop')).not.toBeInTheDocument();
  expect(screen.queryByText('Repositórios')).not.toBeInTheDocument();
};

describe('SideMenu em tela estreita, aberto por cima do conteúdo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    (useMediaQuery as jest.Mock).mockReturnValue(true);
  });

  it('começa recolhido, na coluna, e o botão abre o menu por cima do conteúdo', () => {
    renderMenu();
    expectClosed();

    openMenu();
    expect(screen.getByText('Repositórios')).toBeInTheDocument();
  });

  it('fecha com Esc', () => {
    renderMenu();
    openMenu();

    fireEvent.keyDown(document, { key: 'Escape' });
    expectClosed();
  });

  it('fecha ao clicar fora', () => {
    renderMenu();
    openMenu();

    fireEvent.click(screen.getByTestId('side-menu-backdrop'));
    expectClosed();
  });

  it('fecha ao escolher um item e navega para ele', () => {
    renderMenu();
    openMenu();

    fireEvent.click(screen.getByText('Repositórios'));
    expectClosed();
    expect(mockPush).toHaveBeenCalledWith('/products/1-5-MeasureSoftGram/repositories');
  });

  it('abrir o submenu de Dashboards não fecha o menu; escolher um dashboard fecha', () => {
    renderMenu();
    openMenu();

    fireEvent.click(screen.getByText('Dashboards'));
    expect(screen.getByTestId('side-menu-backdrop')).toBeInTheDocument();

    fireEvent.click(screen.getByText('5. Distribuição Estatística'));
    expectClosed();
    expect(mockPush).toHaveBeenCalledWith('/products/1-5-MeasureSoftGram/dashboards/distribuicao');
  });

  it('outras teclas não fecham o menu', () => {
    renderMenu();
    openMenu();

    fireEvent.keyDown(document, { key: 'Enter' });
    expect(screen.getByTestId('side-menu-backdrop')).toBeInTheDocument();
  });
});

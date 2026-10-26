import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SideMenuWrapper from '../SideMenuWrapper';

const mockToggleCollapse = jest.fn();
const mockSideMenu = { isCollapsed: false, toggleCollapse: mockToggleCollapse };

jest.mock('@contexts/SidebarProvider/SideMenuProvider', () => ({
  useSideMenuContext: () => mockSideMenu,
}));

jest.mock('@hooks/useProviderTranslation', () => ({
  useProviderTranslation: () => ({ t: (key: string) => key, i18n: { language: 'pt' } }),
}));

jest.mock('@components/Translation/Translation', () => () => <div>idioma</div>);
jest.mock('../../OrganizationSelector', () => () => <div>organização</div>);
jest.mock('../../ProductsSelector', () => () => <div>produto</div>);

describe('<SideMenuWrapper />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSideMenu.isCollapsed = false;
  });

  it('o menu fica fixo na altura da tela e rola por dentro quando é maior que ela', () => {
    render(<SideMenuWrapper menuItems={<div>itens</div>} footer={<div>usuário</div>} />);

    // o jsdom não calcula a altura: o teste confere as regras, e os prints do PR, a rolagem de fato
    expect(screen.getByTestId('side-menu')).toHaveStyle({ position: 'sticky', top: '0px', height: '100vh' });
    expect(screen.getByTestId('side-menu')).not.toHaveStyle({ overflowY: 'auto' });

    const content = screen.getByTestId('side-menu-content');
    expect(content).toHaveStyle({ height: '100%', overflowY: 'auto' });
    expect(content).toContainElement(screen.getByText('itens'));
    expect(content).toContainElement(screen.getByText('usuário'));
  });

  it('o botão de recolher fica fora da área que rola, para não ser cortado', () => {
    render(<SideMenuWrapper menuItems={<div>itens</div>} />);

    const button = screen.getByTestId('side-menu-collapse');
    expect(screen.getByTestId('side-menu')).toContainElement(button);
    expect(screen.getByTestId('side-menu-content')).not.toContainElement(button);
  });

  it('o botão recolhe o menu expandido e expande o recolhido', () => {
    const { rerender } = render(<SideMenuWrapper />);
    expect(screen.getByText('idioma')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('side-menu-collapse'));
    expect(mockToggleCollapse).toHaveBeenCalledTimes(1);

    mockSideMenu.isCollapsed = true;
    rerender(<SideMenuWrapper />);
    expect(screen.queryByText('idioma')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('side-menu-collapse'));
    expect(mockToggleCollapse).toHaveBeenCalledTimes(2);
  });
});

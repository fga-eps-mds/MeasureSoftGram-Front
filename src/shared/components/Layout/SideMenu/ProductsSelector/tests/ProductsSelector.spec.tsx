import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ProductSelector from '../ProductsSelector';

const mockPush = jest.fn();
const mockSetCurrentProduct = jest.fn();
const mockCloseOverlay = jest.fn();
const PRODUCTS = [
  { id: 1, name: 'Produto A' },
  { id: 2, name: 'Produto B' }
];

jest.mock('next/router', () => ({
  useRouter: () => ({ push: mockPush })
}));

jest.mock('@contexts/OrganizationProvider', () => ({
  useOrganizationContext: () => ({ currentOrganization: { id: 9 } })
}));

jest.mock('@contexts/ProductProvider', () => ({
  useProductContext: () => ({
    currentProduct: PRODUCTS[0],
    setCurrentProduct: mockSetCurrentProduct,
    productsList: PRODUCTS
  })
}));

jest.mock('@contexts/SidebarProvider/SideMenuProvider', () => ({
  useSideMenuContext: () => ({ toggleCollapse: jest.fn(), isCollapsed: false, closeOverlay: mockCloseOverlay })
}));

jest.mock('@contexts/Auth', () => ({
  useAuth: () => ({ provider: 'github' })
}));

jest.mock('../../../../../../components/idv/inputs/MSGSelectBox', () => function MockSelectBox({ onChange }: any) {
  return <button onClick={() => onChange({ id: 2 })}>escolher produto</button>;
});

describe('<ProductSelector />', () => {
  it('Deve selecionar o produto e navegar para a página dele', () => {
    render(<ProductSelector />);

    fireEvent.click(screen.getByText('escolher produto'));

    expect(mockSetCurrentProduct).toHaveBeenCalledWith(PRODUCTS[1]);
    expect(mockPush).toHaveBeenCalledWith('/products/9-2-Produto B');
    // em tela estreita, o menu aberto por cima do conteúdo fecha ao escolher o produto
    expect(mockCloseOverlay).toHaveBeenCalled();
  });
});

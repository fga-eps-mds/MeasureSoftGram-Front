import { findAllByText, findByText, render, } from '@testing-library/react';
import React, { ReactNode } from 'react';
import { RepositoryProvider } from '@contexts/RepositoryProvider';
import { OrganizationProvider } from '@contexts/OrganizationProvider';
import * as ProductProvApi from '@contexts/ProductProvider';
import { SideMenuProvider } from '@contexts/SidebarProvider/SideMenuProvider';
import SideMenu, { SideMenuItemType } from '../SideMenu';
import { Product } from '@customTypes/product';
import { IProductContext } from '@contexts/ProductProvider';

interface Props {
  children: ReactNode;
}

const AllTheProviders = ({ children }: Props) => (
  <OrganizationProvider>
    <ProductProvApi.ProductProvider>
      <RepositoryProvider>
        <SideMenuProvider>{children}</SideMenuProvider>
      </RepositoryProvider>
    </ProductProvApi.ProductProvider>
  </OrganizationProvider>
);

jest.mock('@contexts/ProductProvider', () => ({
    __esModule: true,
    ...jest.requireActual('@contexts/ProductProvider')
}));

jest.mock('../SideMenuWrapper', () => {
  return jest.fn().mockImplementation(() => {
    const products: Product[] = [
      {id: 'prodtest', name: 'prodname', description: 'proddesc', github_url: 'https://test.github.com', created_at: '2022-01-01', updated_at: '2022-01-02'},
      {id: 'prodtest2', name: 'prodname2', description: 'proddesc2', github_url: 'https://test.github.com/proj2', created_at: '2022-02-01', updated_at: '2022-02-02'}
    ]; 

    const productsContext: IProductContext = {
          productsList: products,
          currentProduct: undefined,
          setCurrentProduct: jest.fn(),
          updateProductList: jest.fn()
        }

    const menuItems: SideMenuItemType[] = [
      {startIcon:<p> icon </p>, text: 'test', tooltip: 'testTool', path: 'test/path', disable: false, selected: true},
      {startIcon: <p> cow </p>, text: 'different', tooltip: 'diffTool', path: 'diff/dest', disable: false, selected: true},
    ];

    let count = 0;
    return <div data-testid="mocked-wrapper">
      {menuItems.map((item) => 
        productsContext.currentProduct && item.disable ? <p key={count++}>{item.text}</p> : <p key={(count++) + 10}>Null element</p>)}
    </div>
  });
});

jest.spyOn(ProductProvApi,'useProductContext').mockReturnValue(
    { 
      currentProduct: { 
        id: 'prodtest', 
        name: 'prodname', 
        description: 'proddesc',
        github_url: 'https://test.github.com',
        created_at: '2022-01-01', 
        updated_at: '2022-01-02'
      } as Product
    } as IProductContext
)
describe('SideMenuItem', () => {
  it('should render the SideMenuItem component', () => {
    const { container } = render(<SideMenu/>, {
      wrapper: AllTheProviders
    });

    expect(container).toMatchSnapshot();
  });

  it('should render the SideMenuItem component with endIcon', () => {
    const { container } = render(
      <SideMenu/>,
      { wrapper: AllTheProviders }
    );

    expect(container).toMatchSnapshot();
  });

  it('should not render without current product', async() => {

    const { container } = render(
      <SideMenu />,
      { wrapper: AllTheProviders }
    );

    const elem = await findAllByText(container, 'Null element');
    expect(elem).not.toBeNull();
    expect(ProductProvApi.useProductContext).toHaveBeenCalled();
  });
});
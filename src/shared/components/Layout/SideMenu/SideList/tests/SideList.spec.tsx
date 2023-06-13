import { render, fireEvent } from '@testing-library/react';
import Router, { useRouter } from 'next/router';
import React, { ReactNode } from 'react';
import { RepositoryProvider } from '@contexts/RepositoryProvider';
import { OrganizationProvider } from '@contexts/OrganizationProvider';
import { ProductProvider } from '@contexts/ProductProvider';
import { SideMenuProvider } from '@contexts/SidebarProvider/SideMenuProvider';
import SideList from '../SideList';
import { Product } from '@customTypes/product';

interface Props {
  children: ReactNode;
}

const AllTheProviders = ({ children }: Props) => (
  <OrganizationProvider>
    <ProductProvider>
      <RepositoryProvider>
        <SideMenuProvider>{children}</SideMenuProvider>
      </RepositoryProvider>
    </ProductProvider>
  </OrganizationProvider>
);

describe('SideMenuItem', () => {
  const products: Product[] = [
    {id: 'prodtest', name: 'prodname', description: 'proddesc', github_url: 'https://test.github.com', created_at: '2022-01-01', updated_at: '2022-01-02'},
    {id: 'prodtest2', name: 'prodname2', description: 'proddesc2', github_url: 'https://test.github.com/proj2', created_at: '2022-02-01', updated_at: '2022-02-02'}
  ];

  jest.mock('next/router', () => ({
    __esModule: true,
    useRouter: jest.fn()
  }));

  it('should render the SideMenuItem component', () => {
    const onClose = jest.fn();
    const onClick = jest.fn();
    const { container } = render(<SideList values={products} onClose={onClose} onClickItem={onClick} open={true} seeMorePath="path/test"/>, {
      wrapper: AllTheProviders
    });

    expect(container).toMatchSnapshot();
  });

  it('should fire child events when child is clicked', () => {
    const onClose = jest.fn();
    const onClick = jest.fn();
    const { getAllByText } = render(<SideList values={products} onClose={onClose} onClickItem={onClick} open={true} seeMorePath="path/test"/>,
      { wrapper: AllTheProviders });

    const productsOnList = getAllByText(/prodname2/i);
    productsOnList .forEach((product) => {fireEvent.click(product);});
    expect(onClick).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('should access the \"VER MAIS\" page', () => {
    const onClose = jest.fn();
    const onClick = jest.fn();

    const mockRouter = { push: jest.fn() };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    
    const { getAllByText } = render(<SideList values={products} onClose={onClose} onClickItem={onClick} open={true} seeMorePath="path/test"/>,
      { wrapper: AllTheProviders });

    const btnToPage = getAllByText(/VER MAIS.../i);
    btnToPage.forEach((btn) => {fireEvent.click(btn);});
    expect(mockRouter.push).toHaveBeenCalledWith('path/test');
  });

  });
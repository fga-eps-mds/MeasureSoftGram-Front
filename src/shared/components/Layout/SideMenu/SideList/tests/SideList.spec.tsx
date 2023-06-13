import { render, fireEvent, getByText } from '@testing-library/react';
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

  // it('should render the SideMenuItem component with selected', () => {
  //   const { container } = render(
  //     <SideMenuItem startIcon={<FiAlertTriangle />} text="Text" tooltip="Tooltip Text" selected />,
  //     { wrapper: AllTheProviders }
  //   );

  //   expect(container).toMatchSnapshot();
  // });

  // it('should render the SideMenuItem component with disable', () => {
  //   const { container } = render(
  //     <SideMenuItem startIcon={<FiAlertTriangle />} text="Text" tooltip="Tooltip Text" disable />,
  //     { wrapper: AllTheProviders }
  //   );

  //   expect(container).toMatchSnapshot();
  // });

  // it('should render the SideMenuItem component with onClick', () => {
  //   const onClickHandle = jest.fn();
  //   const { container } = render(
  //     <SideMenuItem startIcon={<FiAlertTriangle />} text="Text" tooltip="Tooltip Text" onClick={onClickHandle} />,
  //     { wrapper: AllTheProviders }
  //   );

  //   fireEvent.click(container.firstChild as HTMLElement);

  //   expect(onClickHandle).toHaveBeenCalled();
  //   expect(container).toMatchSnapshot();
  // });
});
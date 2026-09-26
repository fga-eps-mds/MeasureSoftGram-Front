import { render, fireEvent } from '@testing-library/react';
import { FiAlertTriangle } from 'react-icons/fi';
import React, { ReactNode } from 'react';
import { RepositoryProvider } from '@contexts/RepositoryProvider';
import { OrganizationProvider } from '@contexts/OrganizationProvider';
import { ProductProvider } from '@contexts/ProductProvider';
import { SideMenuProvider } from '@contexts/SidebarProvider/SideMenuProvider';
import SideMenuItem from '../SideMenuItem';

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
  it('should render the SideMenuItem component', () => {
    const { container } = render(<SideMenuItem startIcon={<FiAlertTriangle />} text="Text" tooltip="Tooltip Text" />, {
      wrapper: AllTheProviders
    });

    expect(container).toMatchSnapshot();
  });

  it('should render the SideMenuItem component with endIcon', () => {
    const { container } = render(
      <SideMenuItem startIcon={<FiAlertTriangle />} text="Text" tooltip="Tooltip Text" endIcon={<FiAlertTriangle />} />,
      { wrapper: AllTheProviders }
    );

    expect(container).toMatchSnapshot();
  });

  it('should render the SideMenuItem component with selected', () => {
    const { container } = render(
      <SideMenuItem startIcon={<FiAlertTriangle />} text="Text" tooltip="Tooltip Text" selected />,
      { wrapper: AllTheProviders }
    );

    expect(container).toMatchSnapshot();
  });

  it('should render the SideMenuItem component with disable', () => {
    const { container } = render(
      <SideMenuItem startIcon={<FiAlertTriangle />} text="Text" tooltip="Tooltip Text" disable />,
      { wrapper: AllTheProviders }
    );

    expect(container).toMatchSnapshot();
  });

  it('should render the SideMenuItem component with onClick', () => {
    const onClickHandle = jest.fn();
    const { container } = render(
      <SideMenuItem startIcon={<FiAlertTriangle />} text="Text" tooltip="Tooltip Text" onClick={onClickHandle} />,
      { wrapper: AllTheProviders }
    );

    fireEvent.click(container.firstChild as HTMLElement);

    expect(onClickHandle).toHaveBeenCalled();
    expect(container).toMatchSnapshot();
  });
});

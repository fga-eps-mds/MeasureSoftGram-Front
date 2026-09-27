import { render } from '@testing-library/react';
import { FiAlertTriangle } from 'react-icons/fi';
import React from 'react';
import { productQuery } from '@services/product';
import SideMenuItem from '../SideMenuItem';

jest.mock('@services/product');
jest.mock('next/router', () => ({ useRouter: () => ({ query: { product: '1-2-produto' } }) }));
jest.mock('@contexts/SidebarProvider/SideMenuProvider', () => ({
  useSideMenuContext: () => ({ isCollapsed: false })
}));

describe('SideMenuItem requests', () => {
  it('does not fetch product data when rendered', () => {
    render(
      <>
        <SideMenuItem startIcon={<FiAlertTriangle />} text="A" tooltip="A" />
        <SideMenuItem startIcon={<FiAlertTriangle />} text="B" tooltip="B" />
      </>
    );

    expect(productQuery.getProductById).not.toHaveBeenCalled();
    expect(productQuery.getAllRepositories).not.toHaveBeenCalled();
  });
});

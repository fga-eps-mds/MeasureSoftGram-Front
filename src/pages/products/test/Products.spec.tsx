import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProductProvider } from '@contexts/ProductProvider';
import { OrganizationProvider } from '@contexts/OrganizationProvider';
import Products from '../Products';
import '@testing-library/jest-dom';


jest.mock('next/router', () => ({
  useRouter: () => ({
    push: () => jest.fn(),
  })
}));

describe('Products', () => {
  describe('Snapshot', () => {
    it('Deve corresponder ao Snapshot', () => {
      const tree = render(
        <OrganizationProvider>
          <ProductProvider>
            <Products />
          </ProductProvider>
        </OrganizationProvider>
      );
      expect(tree).toMatchSnapshot();
    });
  });

  describe('Renderização e Estilos', () => {
    it('Renderiza corretamente os elementos', () => {
      render(
        <OrganizationProvider>
          <ProductProvider>
            <Products />
          </ProductProvider>
        </OrganizationProvider>
      );

      expect(screen.getByTestId('organization-title')).toHaveTextContent('Organizações');

      const organizationBox = screen.getByTestId('organization-box');
      expect(organizationBox).toBeInTheDocument();
      expect(organizationBox).toHaveStyle({
        maxHeight: '120px',
        overflowX: 'auto',
        overflowY: 'hidden'
      });

    });
  });
});

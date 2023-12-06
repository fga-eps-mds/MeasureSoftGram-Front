import React from 'react';
import { render } from '@testing-library/react';
import { ProductProvider } from '@contexts/ProductProvider';
import { OrganizationProvider } from '@contexts/OrganizationProvider';
import Products from '../Products';

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: () => jest.fn(),
  })
}));

const mockProductsList = [
  { id: 'prodtest', name: 'prodname', description: 'proddesc', github_url: 'https://test.github.com', created_at: '2022-01-01', updated_at: '2022-01-02' },
  { id: 'prodtest2', name: 'prodname2', description: 'proddesc2', github_url: 'https://test.github.com/proj2', created_at: '2022-02-01', updated_at: '2022-02-02' }
];

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

    it('Renderiza corretamente os elementos', () => {
      const { getByTestId } = render(
        <OrganizationProvider>
          <ProductProvider>
            <Products />
          </ProductProvider>
        </OrganizationProvider>
      );

      expect(getByTestId('organization-title')).toBeDefined();
    });

    it('renders without crashing', () => {
      const { getByText } = render(
        <OrganizationProvider>
          <ProductProvider>
            <Products />
          </ProductProvider>
        </OrganizationProvider>
      );

      expect(getByText('Organizações')).toBeInTheDocument();
    });
  });
});

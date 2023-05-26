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
});

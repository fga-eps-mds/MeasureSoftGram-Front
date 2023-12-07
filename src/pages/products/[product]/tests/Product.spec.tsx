import React from 'react';
import { render } from '@testing-library/react';

import { OrganizationProvider } from '@contexts/OrganizationProvider';
import Product from '../Product';

jest.mock('@contexts/ProductProvider', () => ({
  useProductContext: () => ({
    currentProduct: {
      name: `aoba`
    }
  })
}));

jest.mock('@contexts/RepositoryProvider', () => ({
  useRepositoryContext: () => ({})
}));

jest.mock('next/router', () => ({
  useRouter: () => ({
    query: { product: "1-5-MeasureSoftGram" },
    push: () => jest.fn(),
  })
}));

describe('Product', () => {
  describe('Snapshot', () => {
    it('Deve corresponder ao Snapshot', () => {
      const tree = render(
        <OrganizationProvider>
          <Product />
        </OrganizationProvider>
      );

      expect(tree).toMatchSnapshot();
    });
  });
});

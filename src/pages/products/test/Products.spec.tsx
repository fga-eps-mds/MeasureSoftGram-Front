import React from 'react';
import { render } from '@testing-library/react';
import { ProductProvider } from '@contexts/ProductProvider';
import Products from '../Products';

describe('Products', () => {
  describe('Snapshot', () => {
    it('Deve corresponder ao Snapshot', () => {
      const tree = render(
        <ProductProvider>
          <Products />
        </ProductProvider>
      );
      expect(tree).toMatchSnapshot();
    });
  });
});

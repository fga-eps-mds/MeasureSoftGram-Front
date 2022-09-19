import '@testing-library/jest-dom';

import React from 'react';
import { render } from '@testing-library/react';

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

describe('Product', () => {
  describe('Snapshot', () => {
    it('Deve corresponder ao Snapshot', () => {
      const tree = render(<Product />);

      expect(tree).toMatchSnapshot();
    });
  });
});

import '@testing-library/jest-dom';

import React from 'react';
import { render } from '@testing-library/react';

import Repository from '../Repository';

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

describe('Repository', () => {
  describe('Snapshot', () => {
    it('Deve corresponder ao Snapshot', () => {
      const tree = render(<Repository />);

      expect(tree).toMatchSnapshot();
    });
  });
});

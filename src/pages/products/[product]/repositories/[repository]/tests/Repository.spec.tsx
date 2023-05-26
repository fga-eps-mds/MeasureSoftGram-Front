import '@testing-library/jest-dom';

import React from 'react';
import { render } from '@testing-library/react';

import { OrganizationProvider } from '@contexts/OrganizationProvider';
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

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: () => jest.fn(),
  })
}));

describe('Repository', () => {
  describe('Snapshot', () => {
    it('Deve corresponder ao Snapshot', () => {
      const tree = render(
        <OrganizationProvider>
          <Repository />
        </OrganizationProvider>
      );

      expect(tree).toMatchSnapshot();
    });
  });
});

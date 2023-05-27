import '@testing-library/jest-dom';

import React from 'react';
import { render } from '@testing-library/react';

import { OrganizationProvider } from '@contexts/OrganizationProvider';
import { ProductProvider } from '@contexts/ProductProvider';
import { RepositoryProvider } from '@contexts/RepositoryProvider';
import Layout from '../Layout';

describe('<Layout />', () => {
  describe('Snapshot', () => {
    it('Deve corresponder ao Snapshot', () => {
      const tree = render(
        <OrganizationProvider>
          <ProductProvider>
            <RepositoryProvider>
              <Layout />
            </RepositoryProvider>
          </ProductProvider>
        </OrganizationProvider>
      );
      expect(tree).toMatchSnapshot();
    });
  });
});
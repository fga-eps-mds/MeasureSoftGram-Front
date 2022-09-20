import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import { OrganizationProvider } from '@contexts/OrganizationProvider';
import { ProductProvider } from '@contexts/ProductProvider';
import ConfigPage from '../ConfigPage';

const REPO_NAME = 'REPO_TITLE';

describe('<ConfigPage />', () => {
  describe('Snapshot', () => {
    it('Deve corresponder ao Snapshot', () => {
      const tree = render(
        <OrganizationProvider>
          <ProductProvider>
            <ConfigPage isOpen onClose={jest.fn()} repoName={REPO_NAME} organizationId="1" productId="1" />
          </ProductProvider>
        </OrganizationProvider>
      );
      expect(tree).toMatchSnapshot();
    });
  });
});

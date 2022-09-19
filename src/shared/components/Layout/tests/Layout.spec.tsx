import '@testing-library/jest-dom';

import React from 'react';
import { render } from '@testing-library/react';

import { OrganizationProvider } from '@contexts/OrganizationProvider';
import Layout from '../Layout';

describe('<Layout />', () => {
  describe('Snapshot', () => {
    it('Deve corresponder ao Snapshot', () => {
      const tree = render(
        <OrganizationProvider>
          <Layout />
        </OrganizationProvider>
      );
      expect(tree).toMatchSnapshot();
    });
  });
});

import '@testing-library/jest-dom';

import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import { ProductProvider } from '@contexts/ProductProvider';
import RepositoriesTable from '../RepositoriesTable';

jest.mock('@contexts/RepositoryProvider', () => ({
  useRepositoryContext: () => ({
    repositoryList: [{"id":19,"name":"2022-1-MeasureSoftGram-Core"}]
  })
}));

jest.mock('@contexts/OrganizationProvider', () => ({
  useOrganizationContext: () => ({
    currentOrganization: { id: 1 }
  })
}));

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}));

describe('RepositoriesTable', () => {
  describe('Snapshot', () => {
    it('Deve corresponder ao Snapshot', () => {
      const tree = render(
        <ProductProvider>
            <RepositoriesTable />
        </ProductProvider>
      );

      fireEvent.click(tree.getByTestId("repository-row"))

      expect(tree).toMatchSnapshot();
    });
  });
});

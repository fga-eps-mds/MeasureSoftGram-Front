import '@testing-library/jest-dom';

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { ProductProvider } from '@contexts/ProductProvider';
import RepositoriesTable from '../RepositoriesTable';

jest.mock('@contexts/RepositoryProvider', () => ({
  useRepositoryContext: () => ({
    repositoryList: [{ id: 19, name: '2022-1-MeasureSoftGram-Core' }]
  })
}));

jest.mock('@contexts/OrganizationProvider', () => ({
  useOrganizationContext: () => ({
    currentOrganization: { id: 1 }
  })
}));

const mockPush = jest.fn();

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush
  })
}));

describe('RepositoriesTable', () => {
  describe('Functions', () => {
    test('chama a função handleRepositoriesFilter corretamente', () => {
      render(
        <ProductProvider>
          <RepositoriesTable />
        </ProductProvider>
      );
      const input = screen.getByRole('textbox', { name: /Insira o nome do repositório/i });
      fireEvent.change(input, { target: { value: 'Core' } });
      expect(screen.getByRole('table')).toHaveTextContent('2022-1-MeasureSoftGram-Core');
    });
  });
  describe('Snapshot', () => {
    it('Deve corresponder ao Snapshot', () => {
      const tree = render(
        <ProductProvider>
          <RepositoriesTable />
        </ProductProvider>
      );

      fireEvent.click(tree.getByTestId('repository-row'));

      expect(tree).toMatchSnapshot();
    });
  });
});

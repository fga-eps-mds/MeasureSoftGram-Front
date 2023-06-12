import '@testing-library/jest-dom';

import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { ProductProvider } from '@contexts/ProductProvider';
// eslint-disable-next-line import/no-extraneous-dependencies
import mockRouter from 'next-router-mock';
import RepositoriesTable from '../RepositoriesTable';

const repositoryName = '2022-1-MeasureSoftGram-Core';

jest.mock('@contexts/RepositoryProvider', () => ({
  useRepositoryContext: () => ({
    repositoryList: [{ id: 19, name: repositoryName }]
  })
}));

jest.mock('@contexts/OrganizationProvider', () => ({
  useOrganizationContext: () => ({
    currentOrganization: { id: 1 }
  })
}));

// eslint-disable-next-line import/no-extraneous-dependencies, global-require
jest.mock('next/router', () => require('next-router-mock'));

describe('RepositoriesTable', () => {
  describe('Functions', () => {
    test('chama a função handleRepositoriesFilter corretamente', async () => {
      const { queryByTestId } = render(
        <ProductProvider>
          <RepositoriesTable />
        </ProductProvider>
      );
      const input = screen.getByRole('textbox', { name: /Insira o nome do repositório/i });
      fireEvent.input(input, { target: { value: 'Core' } });
      await waitFor(() => {
        expect(queryByTestId('repository-row')).toHaveTextContent(repositoryName);
      });
    });

    test('Chama a função handleClickRedirects corretamente', () => {
      const { getByText } = render(
        <ProductProvider>
          <RepositoriesTable />
        </ProductProvider>
      );

      const repositoryRow = getByText(repositoryName);
      fireEvent.click(repositoryRow);

      expect(mockRouter.asPath).toEqual('/products/1-undefined-undefined/repositories/19-2022-1-MeasureSoftGram-Core');
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

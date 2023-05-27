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
          <RepositoriesTable disableButtons />
        </ProductProvider>
      );
      const input = screen.getByRole('textbox', { name: /Insira o nome do repositório/i });
      fireEvent.change(input, { target: { value: 'Core' } });
      expect(screen.getByRole('table')).toHaveTextContent('2022-1-MeasureSoftGram-Core');
    });
    test('executa ações de clique corretamente', () => {
      render(
        <ProductProvider>
          <RepositoriesTable />
        </ProductProvider>
      );
      // Encontra o botão de expandir
      const expandButton = screen.getByLabelText('expand circle row');
      // Simula o clique no botão de expandir
      fireEvent.click(expandButton);
      // Verifica se a linha expandida está visível
      expect(screen.getByText('Não é possível visualizar o gráfico, pois não há dados.')).toBeVisible();
      // Encontra o botão de recolher
      const collapseButton = screen.getByLabelText('collapse row');
      // Simula o clique no botão de recolher
      fireEvent.click(collapseButton);
      // Verifica se a linha expandida não está visível
      const textElement = screen.queryByText('Não é possível visualizar o gráfico, pois não há dados.');
      const textStyle = getComputedStyle(textElement);
      expect(textStyle.height).toBe('');
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

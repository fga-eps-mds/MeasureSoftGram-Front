import '@testing-library/jest-dom';
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';

import RepositoryForm from 'src/pages/products/[product]/repositories/manage-repository/RepositoryForm';
import { OrganizationProvider } from '@contexts/OrganizationProvider';
import { ProductProvider } from '@contexts/ProductProvider';

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    query: { id: '1' }
  })
}));

jest.mock('@services/repository', () => ({
  repository: {
    getRepository: jest.fn().mockResolvedValue({
      data: {
        name: 'Test Repo',
        description: 'Test Description',
        url: 'http://test.com',
        platform: 'github'
      }
    })
  }
}));

describe('RepositoryForm', () => {
  it('Renders correctly and allows input', async () => {
    const { getByLabelText, getByText } = render(
      <OrganizationProvider>
        <ProductProvider>
          <RepositoryForm />
        </ProductProvider>
      </OrganizationProvider>
    );

    await waitFor(() => {
      expect(getByLabelText(/Nome do Repositório/i)).toHaveValue('Test Repo');
    });

    const nameInput = getByLabelText(/Nome do Repositório/i);
    fireEvent.change(nameInput, { target: { value: 'New Repo Name' } });
    expect(nameInput).toHaveValue('New Repo Name');

    expect(getByText(/Criar Repositório/i)).toBeInTheDocument();
  });

});

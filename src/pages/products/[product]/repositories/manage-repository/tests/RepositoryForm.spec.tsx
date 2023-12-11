import '@testing-library/jest-dom';
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';

import RepositoryForm from '../RepositoryForm';

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
        id: 1,
        name: 'Test Repo',
        description: 'Test Description',
        url: 'http://test.com',
        platform: 'github'
      }
    })
  }
}));

jest.mock('@contexts/ProductProvider', () => ({
  useProductContext: jest.fn(() => ({
    currentProduct: {
      id: '1',
      name: 'MeasureSoftGram'
    }
  }))
}));

jest.mock('@contexts/OrganizationProvider', () => ({
  useOrganizationContext: jest.fn(() => ({
    currentOrganization: {
      id: '1'
    }
  }))
}));


jest.mock('@contexts/RepositoryProvider', () => ({
  useRepositoryContext: () => ({}),
}));

describe('RepositoryForm', () => {
  it('Renders correctly and allows input', async () => {
    const { getByLabelText, getByText } = render(
      <RepositoryForm />
    );

    await waitFor(() => {
      expect(getByLabelText(/Nome do Repositório/i)).toHaveValue('Test Repo');
    });

    const nameInput = getByLabelText(/Nome do Repositório/i);
    fireEvent.change(nameInput, { target: { value: 'New Repo Name' } });
    expect(nameInput).toHaveValue('New Repo Name');

    expect(getByText(/Editar Repositório/i)).toBeInTheDocument();
  });

});

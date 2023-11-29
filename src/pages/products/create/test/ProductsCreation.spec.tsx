import React from 'react';
import { render } from '@testing-library/react';
import ProductsCreation from '../ProductsCreation';

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    query: {
      id_organization: '123',
      id_product: '456',
    },
  })),
}));

jest.mock('@contexts/OrganizationProvider', () => ({
  useOrganizationContext: () => ({
    organizationList: [{ id: 1, name: 'Organization 1' }],
  }),
}));

jest.mock('../../hooks/useProductQuery', () => ({
  useProductQuery: () => ({
    createProduct: jest.fn(() => Promise.resolve({ type: 'success' })),
    getProductById: jest.fn(() => Promise.resolve({
      type: 'success',
      value: {
        name: 'Product Name',
        description: 'Product Description',
        organizationId: 1,
      },
    })),
    updateProduct: jest.fn(() => Promise.resolve({ type: 'success' })),
  }),
}));

describe('ProductsCreation Component', () => {
  const { getByTestId } = render(<ProductsCreation />);
  it('renders the "Nome" field', () => {
    const nameField = getByTestId('name-input');

    expect(nameField).toBeDefined();
  });

  it('renders the "Organização" field', () => {
    const orgField = getByTestId('org-input');

    expect(orgField).toBeDefined();
  });

  it('renders the "Descrição" field', () => {
    const descriptionField = getByTestId('description-input');

    expect(descriptionField).toBeDefined();
  });
});

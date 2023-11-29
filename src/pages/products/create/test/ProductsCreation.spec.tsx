import React from 'react';
import { render, fireEvent } from '@testing-library/react';
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
  it('renders the "Nome" field', () => {
    const { getByTestId } = render(<ProductsCreation />);

    const nameField = getByTestId('name-input');

    expect(nameField).toBeDefined();
  });
});

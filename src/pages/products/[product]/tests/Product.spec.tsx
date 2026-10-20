import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { OrganizationProvider } from '@contexts/OrganizationProvider';
import Product from '../Product';

const mockPush = jest.fn();

jest.mock('@contexts/ProductProvider', () => ({
  useProductContext: () => ({
    currentProduct: {
      name: `aoba`
    }
  })
}));

jest.mock('@contexts/RepositoryProvider', () => ({
  useRepositoryContext: () => ({})
}));

jest.mock('next/router', () => ({
  useRouter: () => ({
    query: { product: "1-5-MeasureSoftGram" },
    push: mockPush,
    pathname: '/products/[product]',
  })
}));

jest.mock('@hooks/useRequest', () => ({
  useRequest: () => ({ data: [], isLoading: false })
}));

describe('Product', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('Snapshot', () => {
    it('Deve corresponder ao Snapshot', () => {
      const tree = render(
        <OrganizationProvider>
          <Product />
        </OrganizationProvider>
      );

      expect(tree).toMatchSnapshot();
    });
  });

  it('Deve navegar para os repositórios e para as releases do produto', () => {
    render(
      <OrganizationProvider>
        <Product />
      </OrganizationProvider>
    );

    fireEvent.click(screen.getByText('repo-button'));
    fireEvent.click(screen.getByText('release-button'));

    expect(mockPush).toHaveBeenNthCalledWith(1, '/products/1-5-MeasureSoftGram/repositories');
    expect(mockPush).toHaveBeenNthCalledWith(2, '/products/1-5-MeasureSoftGram/releases');
  });
});

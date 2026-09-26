import React from 'react';
import { render } from '@testing-library/react';

import { OrganizationProvider } from '@contexts/OrganizationProvider';
import Product from '../Product';

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
    push: () => jest.fn(),
    pathname: '/products/[product]',
  })
}));

jest.mock('@services/grafana', () => ({
  grafanaService: {
    getDashboardUrl: jest.fn().mockResolvedValue({ data: { grafana_url: 'http://localhost:5000/d/test' } }),
  }
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
});

import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRequest } from '@hooks/useRequest';
import ProductContent from '../ProductContent';

jest.mock('next/router', () => ({
  useRouter: () => ({
    query: { product: '1-1-MeasureSoftGram' },
    push: jest.fn(),
  }),
}));

jest.mock('@contexts/ProductProvider', () => ({
  useProductContext: () => ({
    currentProduct: {
      id: '1',
      name: 'MeasureSoftGram',
    },
  }),
}));

jest.mock('@contexts/OrganizationProvider', () => ({
  useOrganizationContext: () => ({
    currentOrganization: {
      id: '1',
    },
  }),
}));

jest.mock('@hooks/useGrafanaDashboard', () => ({
  useGrafanaDashboard: () => ({
    grafanaUrl: 'http://localhost:3000/grafana',
    loading: false,
    error: null,
  }),
}));

jest.mock('@hooks/useRequest', () => ({
  useRequest: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('<ProductContent />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders NoReleasesState when product has no releases', () => {
    (useRequest as jest.Mock).mockReturnValue({
      data: { results: [] },
      isLoading: false,
    });

    const { getByText } = render(<ProductContent />);
    expect(getByText('no-releases-title')).toBeInTheDocument();
  });

  it('renders Grafana dashboard when product has releases', () => {
    (useRequest as jest.Mock).mockReturnValue({
      data: { results: [{ id: 1, release_name: 'Release 1' }] },
      isLoading: false,
    });

    const { getByTitle } = render(<ProductContent />);
    expect(getByTitle('Dashboard de Pulso')).toBeInTheDocument();
  });

  it('renders Skeleton when loading releases', () => {
    (useRequest as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    const { container } = render(<ProductContent />);
    expect(container).toBeInTheDocument();
  });
});

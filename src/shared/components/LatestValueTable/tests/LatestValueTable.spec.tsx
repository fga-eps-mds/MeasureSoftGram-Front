import React from 'react';
import { OrganizationProvider } from '@contexts/OrganizationProvider';
import { ProductProvider } from '@contexts/ProductProvider';
import { RepositoryProvider } from '@contexts/RepositoryProvider';
import { render, screen } from '@testing-library/react';
import { useRequestValues } from '@hooks/useRequestValues';
import LatestValueTable from '../LatestValueTable';

interface Props {
  children: React.ReactNode;
}

const AllTheProviders = ({ children }: Props) => (
  <OrganizationProvider>
    <ProductProvider>
      <RepositoryProvider>{children}</RepositoryProvider>
    </ProductProvider>
  </OrganizationProvider>
);

jest.mock('@hooks/useRequestValues');

const data = [
  {
    id: 1,
    key: 'reliability',
    name: 'Reliability',
    description: null,
    latest: {
      id: 292,
      characteristic_id: 1,
      value: 0.9999999846162945,
      created_at: '2023-06-21T19:42:39.423213-03:00'
    }
  },
  {
    id: 2,
    key: 'maintainability',
    name: 'Maintainability',
    description: null,
    latest: {
      id: 293,
      characteristic_id: 2,
      value: 0.7139040869240878,
      created_at: '2023-06-21T19:42:39.423213-03:00'
    }
  }
];

beforeEach(() => {
  jest.clearAllMocks();
});

describe('<LatestValueTable />', () => {
  it('should render correctly', () => {
    useRequestValues.mockReturnValue({
      data,
      error: undefined,
      isLoading: false,
      isValidating: false,
      isEmpty: false
    });

    const { container } = render(<LatestValueTable title="title" value="characteristics" />, {
      wrapper: AllTheProviders
    });

    expect(container).toMatchSnapshot();
  });

  it('should render correctly with empty data', () => {
    useRequestValues.mockReturnValue({
      data: [],
      error: undefined,
      isLoading: false,
      isValidating: false,
      isEmpty: true
    });

    const { container } = render(<LatestValueTable title="title" value="characteristics" />, {
      wrapper: AllTheProviders
    });

    expect(container).toMatchSnapshot();
  });

  it('should render correctly with error', () => {
    useRequestValues.mockReturnValue({
      data: [],
      error: new Error('error'),
      isLoading: false,
      isValidating: false,
      isEmpty: false
    });

    const { container } = render(<LatestValueTable title="title" value="characteristics" />, {
      wrapper: AllTheProviders
    });

    expect(container).toMatchSnapshot();
  });

  it('should render correctly with loading', () => {
    useRequestValues.mockReturnValue({
      data: [],
      error: undefined,
      isLoading: true,
      isValidating: false,
      isEmpty: false
    });

    const { container } = render(<LatestValueTable title="title" value="characteristics" />, {
      wrapper: AllTheProviders
    });

    expect(container).toMatchSnapshot();
  });
});

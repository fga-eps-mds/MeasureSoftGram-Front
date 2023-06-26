import React from 'react';
import { OrganizationProvider } from '@contexts/OrganizationProvider';
import { ProductProvider } from '@contexts/ProductProvider';
import { RepositoryProvider } from '@contexts/RepositoryProvider';
import { render, screen } from '@testing-library/react';
import { useRequestValues } from '@hooks/useRequestValues';
import GraphicChart from '../GraphicChart';

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
    history: [
      {
        id: 286,
        characteristic_id: 1,
        value: 0.9999996641383778,
        created_at: '2023-06-20T22:02:20.715198-03:00'
      },
      {
        id: 288,
        characteristic_id: 1,
        value: 0.9999999801554467,
        created_at: '2023-06-20T22:07:18.486582-03:00'
      }
    ]
  },
  {
    id: 2,
    key: 'maintainability',
    name: 'Maintainability',
    description: null,
    history: [
      {
        id: 287,
        characteristic_id: 2,
        value: 0.4036922248628375,
        created_at: '2023-06-20T22:02:20.715198-03:00'
      },
      {
        id: 289,
        characteristic_id: 2,
        value: 0.7139040869240877,
        created_at: '2023-06-20T22:07:18.486582-03:00'
      }
    ]
  }
];

beforeEach(() => {
  jest.clearAllMocks();
});

describe('<GraphicChart />', () => {
  it('should render correctly', () => {
    useRequestValues.mockReturnValue({
      data,
      error: undefined,
      isLoading: false,
      isValidating: false,
      isEmpty: false
    });

    const { container } = render(<GraphicChart type="line" title="title" value="characteristics" />, {
      wrapper: AllTheProviders
    });

    container.firstChild?.firstChild?.setAttribute('_echarts_instance_', 'ec_123');
    expect(container).toMatchSnapshot();
  });

  it('should render correctly with historical SQC', () => {
    useRequestValues.mockReturnValue({
      data,
      error: undefined,
      isLoading: false,
      isValidating: false,
      isEmpty: false
    });

    const { container } = render(<GraphicChart type="line" title="title" value="characteristics" addHistoricalSQC />, {
      wrapper: AllTheProviders
    });

    container.firstChild?.firstChild?.setAttribute('_echarts_instance_', 'ec_123');
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

    const { container } = render(<GraphicChart type="line" title="title" value="characteristics" />, {
      wrapper: AllTheProviders
    });

    container.firstChild?.firstChild?.setAttribute('_echarts_instance_', 'ec_123');
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

    const { container } = render(<GraphicChart type="line" title="title" value="characteristics" />, {
      wrapper: AllTheProviders
    });

    container.firstChild?.firstChild?.setAttribute('_echarts_instance_', 'ec_123');
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

    const { container } = render(<GraphicChart type="msg" title="title" value="characteristics" />, {
      wrapper: AllTheProviders
    });

    container.firstChild?.firstChild?.setAttribute('_echarts_instance_', 'ec_123');
    expect(container).toMatchSnapshot();
  });
});

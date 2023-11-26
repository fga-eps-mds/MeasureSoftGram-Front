import React from 'react';
import { OrganizationProvider } from '@contexts/OrganizationProvider';
import { ProductProvider } from '@contexts/ProductProvider';
import { RepositoryProvider } from '@contexts/RepositoryProvider';
import { fireEvent, render } from '@testing-library/react';
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

const measureData = [
  {
    id: 1,
    key: "passed_tests",
    name: "Passed Tests",
    description: null,
    latest: {
      id: 318,
      measure_id: 1,
      value: 0.6907459278269361,
      created_at: "2023-10-13T13:09:48-03:00"
    }
  },
  {
    id: 2,
    key: "test_builds",
    name: "Test Builds",
    description: null,
    latest: {
      id: 372,
      measure_id: 2,
      value: 0.06486645104021993,
      created_at: "2023-10-11T11:55:23-03:00"
    }
  },
  {
    id: 3,
    key: "test_coverage",
    name: "Test Coverage",
    description: null,
    latest: {
      id: 446,
      measure_id: 3,
      value: 0.8674433534143255,
      created_at: "2023-10-08T17:13:06-03:00"
    }
  },
  {
    id: 4,
    key: "non_complex_file_density",
    name: "Non Complex File Density",
    description: null,
    latest: {
      id: 476,
      measure_id: 4,
      value: 0.856364236489889,
      created_at: "2023-10-11T04:21:35-03:00"
    }
  },
  {
    id: 5,
    key: "commented_file_density",
    name: "Commented File Density",
    description: null,
    latest: {
      id: 546,
      measure_id: 5,
      value: 0.8074273827928293,
      created_at: "2023-10-14T06:50:10-03:00"
    }
  },
  {
    id: 6,
    key: "duplication_absense",
    name: "Duplication Absense",
    description: null,
    latest: {
      id: 596,
      measure_id: 6,
      value: 0.5209101386167142,
      created_at: "2023-10-14T07:33:23-03:00"
    }
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

  it('should render correctly with autoGrid', () => {
    useRequestValues.mockReturnValue({
      data,
      error: undefined,
      isLoading: false,
      isValidating: false,
      isEmpty: false
    });

    const { container } = render(<GraphicChart type="line" title="title" value="characteristics" autoGrid />, {
      wrapper: AllTheProviders
    });

    container.firstChild?.firstChild?.setAttribute('_echarts_instance_', 'ec_123');
    expect(container).toMatchSnapshot();
  });

  it('should render correctly with historical TSQMI', () => {
    useRequestValues.mockReturnValue({
      data,
      error: undefined,
      isLoading: false,
      isValidating: false,
      isEmpty: false
    });

    const { container } = render(
      <GraphicChart type="line" title="title" value="characteristics" addHistoricalTSQMI />,
      {
        wrapper: AllTheProviders
      }
    );

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

  it('should filter charts options correctly for gauge type', () => {
    useRequestValues.mockReturnValue({
      data: measureData,
      error: undefined,
      isLoading: false,
      isValidating: false,
      isEmpty: false
    });

    const { container } = render(
      <GraphicChart type="gauge" title="title" autoGrid value="measures" valueType="latest-values" addCurrentGoal />, {
      wrapper: AllTheProviders
    });


    expect(container.getElementsByClassName('echarts-for-react ').length).toBe(2);


  });

  it('should change state when button clicks', async () => {
    useRequestValues.mockReturnValue({
      data: measureData,
      error: undefined,
      isLoading: false,
      isValidating: false,
      isEmpty: false
    });

    const { container, findByRole } = render(
      <GraphicChart type="gauge" title="title" autoGrid value="measures" valueType="latest-values" addCurrentGoal />, {
      wrapper: AllTheProviders
    });

    const button = await findByRole("button");
    fireEvent.click(button);

    expect(container.getElementsByClassName('echarts-for-react ').length).toBe(3);


  });
});

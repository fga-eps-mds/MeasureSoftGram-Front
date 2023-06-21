import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { OrganizationProvider } from '@contexts/OrganizationProvider';
import { ProductProvider } from '@contexts/ProductProvider';
import { RepositoryProvider } from '@contexts/RepositoryProvider';
import api from '@services/api';
import { get } from 'lodash';
import MSGChart from '../MSGChart';

const AllTheProviders = ({ children }: any) => (
  <OrganizationProvider>
    <ProductProvider>
      <RepositoryProvider>{children}</RepositoryProvider>
    </ProductProvider>
  </OrganizationProvider>
);

describe('<MSGChart />', () => {
  jest.spyOn(api, 'get').mockResolvedValueOnce({
    status: 200,
    statusText: 'OK',
    data: {
      results: [
        {
          id: 1,
          key: 'reliability',
          name: 'Reliability',
          description: null,
          history: [
            {
              id: 165,
              characteristic_id: 1,
              value: 0.8841939928977373,
              created_at: '2023-01-21T23:43:00-03:00'
            },
            {
              id: 167,
              characteristic_id: 1,
              value: 0.8841939928977373,
              created_at: '2023-01-31T14:49:00-03:00'
            },
            {
              id: 169,
              characteristic_id: 1,
              value: 0.8841939928977373,
              created_at: '2023-02-04T01:04:00-03:00'
            }
          ]
        }
      ]
    }
  });

  it('should render correctly with data', async () => {
    const { container } = render(<MSGChart repositoryId="1" />, {
      wrapper: AllTheProviders
    });

    await waitFor(() => {
      expect(get(api, 'get')).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => screen.findByTestId('current-release-characteristics-chart-loading'));
    await waitFor(() => screen.findByTestId('current-release-characteristics-chart'));
    container.firstChild?.firstChild?.setAttribute('_echarts_instance_', 'ec_123');
    expect(container).toMatchSnapshot();
  });
});

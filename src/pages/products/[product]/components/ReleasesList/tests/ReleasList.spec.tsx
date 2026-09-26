import React from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { useRequest } from '@hooks/useRequest';
import { useRouter } from 'next/router';
import ReleasesList from '../ReleasesList';

jest.mock('next/router', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn()
  })
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

jest.mock('@hooks/useRequest', () => ({
  useRequest: jest.fn(() => ({
    data: [],
    isLoading: false
  }))
}));

afterEach(cleanup);

describe('<ReleasesList />', () => {
  it('renders without crashing', () => {
    const { asFragment } = render(<ReleasesList />);

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders the releases table component when not loading', () => {
    (useRequest as jest.Mock).mockReturnValueOnce({
      data: [
        { id: '1', name: 'Release 1' },
        { id: '2', name: 'Release 2' }
      ],
      isLoading: false
    });

    const { queryByText } = render(<ReleasesList />);

    expect(queryByText('table.name')).toBeInTheDocument();
    expect(queryByText('table.startDate')).toBeInTheDocument();
    expect(queryByText('table.endDate')).toBeInTheDocument();
  });

  it('renders the skeleton when loading', () => {
    (useRequest as jest.Mock).mockReturnValueOnce({
      data: [],
      isLoading: true
    });

    const { queryByText } = render(<ReleasesList />);
    expect(queryByText('Nome')).not.toBeInTheDocument();
  });

  it('render empty array when data is undefined', () => {
    (useRequest as jest.Mock).mockReturnValueOnce({
      data: undefined,
      isLoading: false
    });

    const { queryByText } = render(<ReleasesList />);
    expect(queryByText('table.name')).toBeInTheDocument();
  });

  it('call pushToReleasesPath when click on button', () => {
    const { getByTestId } = render(<ReleasesList />);
    const button = getByTestId('ver-mais-release');
    fireEvent.click(button);
    expect(useRouter().push).toBeCalledWith('/products/1-1-MeasureSoftGram/releases')
  });
});

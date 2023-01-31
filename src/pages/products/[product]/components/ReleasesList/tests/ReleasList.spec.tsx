import React from 'react';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { useRequest } from '@hooks/useRequest';
import ReleasesList from '../ReleasesList';

jest.mock('@contexts/ProductProvider', () => ({
  useProductContext: jest.fn(() => ({
    currentProduct: {
      id: '1'
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

    expect(queryByText('Nome')).toBeInTheDocument();
    expect(queryByText('Início da release')).toBeInTheDocument();
    expect(queryByText('Fim da release')).toBeInTheDocument();
  });
});

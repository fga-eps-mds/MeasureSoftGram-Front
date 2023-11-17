import React from 'react';
import { RepositoryProvider } from '@contexts/RepositoryProvider';
import { render, fireEvent } from '@testing-library/react';
import Header from '../Header';

interface Props {
  children: React.ReactNode;
}

jest.mock('@contexts/OrganizationProvider', () => ({
  useOrganizationContext: jest.fn(() => ({
    currentOrganization: {
      id: '1'
    }
  }))
}));

jest.mock('@contexts/ProductProvider', () => ({
  useProductContext: jest.fn(() => ({
    currentProduct: {
      id: '1',
      name: 'MeasureSoftGram',
      gaugeRedLimit: 0.33,
      gaugeYellowLimit: 0.66
    }
  }))
}));


const AllTheProviders = ({ children }: Props) => (
  <>
    <RepositoryProvider>{children}</RepositoryProvider>
  </>
);

describe('Header', () => {
  it('should render correctly', () => {
    const { container } = render(<Header />, {
      wrapper: AllTheProviders
    });

    expect(container).toMatchSnapshot();
  });

  it('opens and closes the modal correctly', () => {
    const { getByText, queryByText, getByTestId } = render(<Header />, { wrapper: AllTheProviders });

    expect(queryByText('Editar Intervalos')).toBeFalsy();

    const settingsButton = getByTestId('SettingsIcon');
    expect(settingsButton).toBeTruthy();

    fireEvent.click(settingsButton);
    expect(queryByText('Editar Intervalos')).toBeTruthy();

    const cancelButton = getByText('Cancelar');
    expect(cancelButton).toBeTruthy();
    fireEvent.click(cancelButton);
    expect(queryByText('Editar Intervalos')).toBeFalsy();

  });

  it('initialValues should be 0.33 and 0.66', () => {
    const { queryByText, getByTestId } = render(<Header />, { wrapper: AllTheProviders });

    expect(queryByText('Editar Intervalos')).toBeFalsy();

    const settingsButton = getByTestId('SettingsIcon');
    expect(settingsButton).toBeTruthy();

    fireEvent.click(settingsButton);
    expect(queryByText('0.33')).toBeTruthy();
    expect(queryByText('0.66')).toBeTruthy();

  });

});

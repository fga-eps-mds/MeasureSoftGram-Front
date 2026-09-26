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

  <RepositoryProvider>{children}</RepositoryProvider>

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

    const testString = 'edit_intervals';

    expect(queryByText(testString)).toBeFalsy();

    const settingsButton = getByTestId('SettingsIcon');
    expect(settingsButton).toBeTruthy();

    fireEvent.click(settingsButton);
    expect(queryByText(testString)).toBeTruthy();

    const cancelButton = getByText('cancel');
    expect(cancelButton).toBeTruthy();
    fireEvent.click(cancelButton);
    expect(queryByText(testString)).toBeFalsy();

  });

  it('uses i18n keys for the modal title and cancel button', () => {
    const { getByTestId, queryByText } = render(<Header />, { wrapper: AllTheProviders });

    fireEvent.click(getByTestId('SettingsIcon'));

    // Sob o mock de i18n, t(key) => key. Os textos do modal devem vir do
    // namespace 'header', nao hardcoded em portugues.
    expect(queryByText('edit_intervals')).toBeTruthy();
    expect(queryByText('cancel')).toBeTruthy();
  });

  it('shows a legend describing the semaphore ranges', () => {
    const { getByTestId, queryByText } = render(<Header />, { wrapper: AllTheProviders });

    fireEvent.click(getByTestId('SettingsIcon'));

    expect(queryByText('legend_bad')).toBeTruthy();
    expect(queryByText('legend_regular')).toBeTruthy();
    expect(queryByText('legend_good')).toBeTruthy();
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

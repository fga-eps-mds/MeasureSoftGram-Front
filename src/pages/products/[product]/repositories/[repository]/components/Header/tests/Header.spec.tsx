import React from 'react';
import { OrganizationProvider } from '@contexts/OrganizationProvider';
import { ProductProvider } from '@contexts/ProductProvider';
import { RepositoryProvider } from '@contexts/RepositoryProvider';
import { render } from '@testing-library/react';
import Header from '../Header';

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

describe('Header', () => {
  it('should render correctly', () => {
    const { container } = render(<Header />, {
      wrapper: AllTheProviders
    });

    expect(container).toMatchSnapshot();
  });
});

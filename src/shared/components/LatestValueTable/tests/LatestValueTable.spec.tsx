import React from 'react';
import { OrganizationProvider } from '@contexts/OrganizationProvider';
import { ProductProvider } from '@contexts/ProductProvider';
import { RepositoryProvider } from '@contexts/RepositoryProvider';
import LatestValueTable from '@components/LatestValueTable';
import { render } from '@testing-library/react';

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

describe('<LatestValueTable />', () => {
  test('Should render the LatestValueTable component', () => {
    const { container } = render(<LatestValueTable title="Caracteríticas" value="characteristics" />, {
      wrapper: AllTheProviders
    });

    expect(container).toMatchSnapshot();
  });
});

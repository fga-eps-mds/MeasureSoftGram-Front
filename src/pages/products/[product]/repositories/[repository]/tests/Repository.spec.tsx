import '@testing-library/jest-dom';

import React from 'react';
import { render } from '@testing-library/react';

import { OrganizationProvider } from '@contexts/OrganizationProvider';
import Repository from '../Repository';

jest.mock('@contexts/ProductProvider', () => ({
  useProductContext: () => ({
    currentProduct: {
      name: `aoba`
    }
  })
}));

jest.mock('@contexts/RepositoryProvider', () => ({
  useRepositoryContext: () => ({})
}));

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: () => jest.fn()
  })
}));

describe('<Repository />', () => {
  it('Should render correctly', () => {
    const { container } = render(
      <OrganizationProvider>
        <Repository />
      </OrganizationProvider>
    );

    Array.from(container.getElementsByClassName('echarts-for-react')).forEach((chart) => {
      chart.setAttribute('_echarts_instance_', 'ec_123');
    });

    expect(container).toMatchSnapshot();
  });
});

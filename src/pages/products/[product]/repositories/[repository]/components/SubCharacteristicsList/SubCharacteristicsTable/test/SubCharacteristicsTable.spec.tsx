import '@testing-library/jest-dom';

import React from 'react';
import { render } from '@testing-library/react';

import SubCharacteristicsTable from '../SubCharacteristicsTable';

jest.mock('@contexts/RepositoryProvider', () => ({
  useRepositoryContext: () => ({
    historicalSQC: {
      history: [{ id: 302, value: 0.6641230995964292, created_at: new Date('2022-08-28T18:04:48-03:00') }]
    }
  })
}));

jest.mock('@contexts/ProductProvider', () => ({
  useProductContext: () => ({
    currentProduct: {
      name: `aoba`
    }
  })
}));

jest.mock('@contexts/OrganizationProvider', () => ({
  useProductContext: () => ({
    currentOrganization: {
      id: 1
    }
  })
}));

jest.mock('echarts-for-react', () => ({
  __esModule: true,
  ...jest.requireActual('echarts-for-react'),
  default: () => <div />
}));

describe('<SubCharacteristicsTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Snapshot', () => {
    it('Deve corresponder ao Snapshot', () => {
      const tree = render(
        <SubCharacteristicsTable
          checkedOptions={{
            maintainability: true,
            modifiability: true,
            reliability: true,
            testing_status: true
          }}
        />
      );

      expect(tree).toMatchSnapshot();
    });
  });
});

import { renderHook } from '@testing-library/react';
import { useRequest } from '@hooks/useRequest';
import mockRouter from 'next-router-mock';
import { OrganizationProvider, useOrganizationContext } from '../OrganizationProvider';

jest.mock('@hooks/useRequest');
jest.mock('next/router', () => require('next-router-mock'));

const data = [
  {
    id: 1,
    url: 'http://site.com/api/v1/organizations/1/',
    name: 'fga-eps-mds',
    key: 'fga-eps-mds',
    description: null,
    products: [
      'http://site.com/api/v1/organizations/1/products/1/',
      'http://site.com/api/v1/organizations/1/products/2/',
      'http://site.com/api/v1/organizations/1/products/3/'
    ],
    actions: {
      'create a new product': 'http:/site.com//api/v1/organizations/1/products/'
    }
  }
];

describe('OrganizationProvider', () => {
  it('should be able return correctly', () => {
    useRequest.mockReturnValue({ data: { results: data } });
    mockRouter.query = { product: '1-1-product' };

    const { result } = renderHook(() => useOrganizationContext(), {
      wrapper: OrganizationProvider
    });

    expect(result).toMatchSnapshot();
  });
});

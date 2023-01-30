import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, fireEvent, act } from '@testing-library/react';
import { productQuery } from '@services/product';
import Release from '../index.page';

jest.mock('@services/product', () => ({
  productQuery: {
    getCompareGoalAccomplished: jest.fn(),
    getReleaseList: jest.fn()
  }
}));

describe('Release', () => {
  it('renders without crashing', async () => {
    const release = {
      id: 1,
      release_name: 'release name',
      start_at: '2022-01-01T00:00:00.000Z',
      end_at: '2022-01-01T00:00:00.000Z',
      goal: {},
      accomplished: {}
    };
    const releaseList = [
      {
        id: 1,
        release_name: 'release name 1',
        start_at: '2022-01-01T00:00:00.000Z',
        end_at: '2022-01-01T00:00:00.000Z',
        goal: {},
        accomplished: {}
      },
      {
        id: 2,
        release_name: 'release name 2',
        start_at: '2022-01-01T00:00:00.000Z',
        end_at: '2022-01-01T00:00:00.000Z',
        goal: {},
        accomplished: {}
      }
    ];
    (productQuery.getCompareGoalAccomplished as jest.Mock).mockResolvedValue({ data: [release] });
    (productQuery.getReleaseList as jest.Mock).mockResolvedValue({ data: releaseList });
    const props = { release, organizationId: 1, productId: 1 };
    const { getByText } = render(<Release {...props} />);

    await act(async () => {
      expect(getByText('release name')).toBeInTheDocument();
      expect(getByText('Selecione a release')).toBeInTheDocument();
    });
  });
});

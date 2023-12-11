import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, act } from '@testing-library/react';
import { productQuery } from '@services/product';
import Release from '../index.page';

jest.mock('@services/product', () => ({
  productQuery: {
    getReleasesAndPlannedXAccomplishedByID: jest.fn(),
    getReleaseList: jest.fn(),
    getCompareGoalAccomplished: jest.fn()
  }
}));

describe('Release', () => {
  it('renders without crashing', async () => {
    const startAtDate = '2022-01-01T00:00:00.000Z';
    const endAtDate = '2022-04-01T00:00:00.000Z';
    const release = {
      id: 1,
      release_name: 'release name',
      start_at: startAtDate,
      end_at: endAtDate,
      goal: {},
      accomplished: {}
    };
    const releaseList = [
      {
        id: 1,
        release_name: 'release name 1',
        start_at: startAtDate,
        goal: {},
        accomplished: {}
      },
      {
        id: 2,
        release_name: 'release name 2',
        end_at: endAtDate,
        goal: {},
        accomplished: {}
      }
    ];
    (productQuery.getCompareGoalAccomplished as jest.Mock).mockResolvedValue({ data: [release] });
    (productQuery.getReleaseList as jest.Mock).mockResolvedValue({ data: releaseList });
    // const props: any = { releaseId: "1", organizationId: "1", productId: "1" };
    // const { getByText } = render(<Release {...props} />);

    // await act(async () => {
    //   expect(getByText('release name')).toBeInTheDocument();
    //   expect(getByText('Selecione a release')).toBeInTheDocument();
    // });
  });
});

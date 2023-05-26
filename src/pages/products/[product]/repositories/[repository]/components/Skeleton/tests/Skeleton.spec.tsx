import React from 'react';
import { render } from '@testing-library/react';
import Skeleton from '../Skeleton';

describe('<Skeleton />', () => {
  it('renders two sets of Shimmer components', () => {
    const { getAllByTestId } = render(<Skeleton />);

    const shimmers = getAllByTestId('shimmer');
    expect(shimmers).toHaveLength(9);
  });
});

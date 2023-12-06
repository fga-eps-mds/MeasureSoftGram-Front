import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Skeleton from '../Skeleton';

describe('Skeleton', () => {
  describe('Snapshot', () => {
    it('Deve corresponder ao Snapshot', () => {
      const tree = render(
        <Skeleton />
      );
      expect(tree).toMatchSnapshot();
    });

    it('verifica as propriedades do primeiro elemento Shimmer', () => {
      const { getByTestId } = render(<Skeleton />);
      const primeiroShimmer = getByTestId('primeiro-shimmer');
      expect(primeiroShimmer).toHaveStyle('height: 65px');
      expect(primeiroShimmer).toHaveStyle('width: 300px');
    });
  });
});

import React from 'react';
import { render } from '@testing-library/react';
import Skeleton from '../Skeleton';

describe('Skeleton', () => {
  describe('Snapshot', () => {
    it('Deve corresponder ao Snapshot', () => {
      const tree = render(
        <Skeleton />
      );
      expect(tree).toMatchSnapshot();
    });
  });
});

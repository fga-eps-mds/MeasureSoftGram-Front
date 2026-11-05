import '@testing-library/jest-dom';

import React from 'react';

import { render } from '@testing-library/react';

import CardNavigation from '../CardNavigation';

describe('<CardNavigation />', () => {
  describe('Snapshot', () => {
    it('Deve corresponder ao Snapshot', () => {
      const tree = render(<CardNavigation id={1} name="Simbora" url="/simbora" />);
      expect(tree).toMatchSnapshot();
    });
  });

  describe('Comportamento', () => {
    it('Deve apontar para a url do card', () => {
      const { getByText } = render(<CardNavigation id={1} name="Simbora" url="/simbora" />);

      expect(getByText('Simbora').closest('a')).toHaveAttribute('href', '/simbora');
    });
  });
});

import '@testing-library/jest-dom';

import React from 'react';

import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CardNavigation from '../CardNavigation';

describe('<CardNavigation />', () => {
  describe('Snapshot', () => {
    it('Deve corresponder ao Snapshot', () => {
      const tree = render(<CardNavigation id={1} name="Simbora" url="/simbora" />);
      expect(tree).toMatchSnapshot();
    });
  });

  describe('Comportamento', () => {
    it('Deve executar a ação de clique', async () => {
      const { getByText } = render(<CardNavigation id={1} name="Simbora" url="/simbora" />);

      const clickCard = getByText('Simbora');
      userEvent.click(clickCard);
    });
  });
});

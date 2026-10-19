import '@testing-library/jest-dom';

import React from 'react';

import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import { MemoryRouterProvider } from 'next-router-mock/MemoryRouterProvider/next-12';

import CardNavigation from '../CardNavigation';

describe('<CardNavigation />', () => {
  describe('Snapshot', () => {
    it('Deve corresponder ao Snapshot', () => {
      const tree = render(<CardNavigation id={1} name="Simbora" url="/simbora" />);
      expect(tree).toMatchSnapshot();
    });
  });

  describe('Comportamento', () => {
    it('Deve navegar para a url do card ao clicar', async () => {
      const { getByText } = render(<CardNavigation id={1} name="Simbora" url="/simbora" />, {
        wrapper: MemoryRouterProvider
      });

      await userEvent.click(getByText('Simbora'));

      expect(mockRouter.asPath).toBe('/simbora');
    });
  });
});

import '@testing-library/jest-dom';

import React from 'react';

import { render, screen } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';

import Layout from '../Layout';

describe('<Layout />', () => {
  describe('Snapshot', () => {
    it('Deve corresponder ao Snapshot', () => {
      const tree = render(<Layout />);
      expect(tree).toMatchSnapshot();
    });
  });

  describe('Comportamento', () => {
    it('Deve mostrar apenas o Layout principal', () => {
      const { getByRole } = render(<Layout />);

      getByRole('img');
    });

    it('', async () => {
      // jest.mock('next/config', () => () => ({
      //   publicRuntimeConfig: {
      //     YGGDRASIL_URL: downloadUrl
      //   }
      // }));
      // render(<Layout />);
      // const clickCard = screen.getByText('Simbora');
      // userEvent.click(clickCard);
    });
  });
});

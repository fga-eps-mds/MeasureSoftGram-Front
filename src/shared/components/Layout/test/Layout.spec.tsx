import '@testing-library/jest-dom';

import React from 'react';
import { render } from '@testing-library/react';

import setRouteQuery from '@tests/helper/router';

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
      const { getByRole, getByText } = render(<Layout />);
      getByRole('img');
      getByText('Organizações');
      getByText('Projetos');
    });

    it('Deve mostrar Layout com subheader', async () => {
      setRouteQuery({
        project: 'measure',
        projectId: 1
      });

      const { getByRole, getByText } = render(<Layout />);
      getByRole('img');
      getByText('Organizações');
      getByText('Medidas');
    });
  });
});

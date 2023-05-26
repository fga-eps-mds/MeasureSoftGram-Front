import React from 'react';
import { render } from '@testing-library/react';
import { AuthProvider } from '@contexts/Auth';
import Home from '../index.page';

describe('Home', () => {
  describe('Snapshot', () => {
    it('Deve corresponder ao Snapshot', () => {
      const tree = render(
        <AuthProvider>
          <Home />
        </AuthProvider>
      );
      expect(tree).toMatchSnapshot();
    });
  });
});

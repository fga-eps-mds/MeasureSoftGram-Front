import React from 'react';
import { render } from '@testing-library/react';
import { AuthProvider } from '@contexts/Auth';
import Auth from '../index.page';

describe('Auth', () => {
  describe('Snapshot', () => {
    it('Deve corresponder ao Snapshot', () => {
      const tree = render(
        <AuthProvider>
          <Auth />
        </AuthProvider>
      );
      expect(tree).toMatchSnapshot();
    });
  });
});

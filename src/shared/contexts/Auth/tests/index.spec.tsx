import React from 'react';
import { render } from '@testing-library/react';
import { AuthProvider } from '../index';

describe('AuthProvider', () => {
  test('should render AuthProvider correctly with children', () => {
    const { getByTestId } = render(
      <AuthProvider>
        <div data-testid="child">Child</div>
      </AuthProvider>
    );

    expect(getByTestId('child').textContent).toBe('Child');
  });
});
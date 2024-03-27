import React from 'react';
import { act, render, renderHook } from '@testing-library/react';
import { AuthProvider, useAuth } from '../index';

describe('AuthProvider', () => {
  test('should render AuthProvider correctly with children', () => {
    const { getByTestId } = render(
      <AuthProvider>
        <div data-testid="child">Child</div>
      </AuthProvider>
    );

    expect(getByTestId('child').textContent).toBe('Child');
  });

  test('should useAuth hook return correct', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    expect(result.current.session).toBe(null);
    expect(result.current.provider).toBe('credentials');
    expect(result.current.loading).toBe('loaded');
    expect(result.current.setProvider).toBeInstanceOf(Function);
    expect(result.current.signInWithCredentials).toBeInstanceOf(Function);
    expect(result.current.signInWithGithub).toBeInstanceOf(Function);
    expect(result.current.logout).toBeInstanceOf(Function);
  });
});

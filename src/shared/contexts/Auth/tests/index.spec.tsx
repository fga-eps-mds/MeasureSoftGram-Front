import React from 'react';
import { act, render, renderHook, waitFor } from '@testing-library/react';
import { createOAuthState } from '@services/Auth/oauthState';
import { AuthProvider, useAuth } from '../index';

// Mock next/router
const mockPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));

// Mock Auth services
jest.mock('@services/Auth', () => ({
  getUserInfo: jest.fn().mockResolvedValue({ type: 'error', error: new Error('no token') }),
  signInCredentials: jest.fn(),
  signInGithub: jest.fn(),
  signOut: jest.fn().mockResolvedValue({ type: 'success', value: {} }),
}));

// Mock ConfirmModal
jest.mock('@components/ConfirmModal/ConfirmModal', () => function MockConfirmModal() {
    return <div data-testid="confirm-modal" />;
  });

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    // Reset globalThis.location.search
    Object.defineProperty(globalThis, 'location', {
      value: { search: '', href: 'http://localhost/', pathname: '/' },
      writable: true,
    });
  });

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

  test('should call signInWithGithub when code and a valid state are present', async () => {
    const { signInGithub } = require('@services/Auth');
    signInGithub.mockResolvedValueOnce({
      type: 'success',
      value: { key: 'fake-key' }
    });

    const state = createOAuthState('github');

    Object.defineProperty(globalThis, 'location', {
      value: {
        search: `?code=github_code_123&state=${state}`,
        href: `http://localhost/?code=github_code_123&state=${state}`,
        pathname: '/',
      },
      writable: true,
    });

    render(
      <AuthProvider>
        <div>Child</div>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(signInGithub).toHaveBeenCalledWith('github_code_123');
    });
  });

  test('should render ConfirmModal component', () => {
    const { getByTestId } = render(
      <AuthProvider>
        <div data-testid="child">Child</div>
      </AuthProvider>
    );

    expect(getByTestId('confirm-modal')).toBeTruthy();
  });
});

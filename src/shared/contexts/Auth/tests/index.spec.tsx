import React from 'react';
import { act, render, renderHook, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../index';

// Mock next/router
const mockPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
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

  test('should redirect with state when code and state params are present', async () => {
    Object.defineProperty(globalThis, 'location', {
      value: {
        search: '?code=abc123&state=/products/1-test/repositories/2-repo',
        href: 'http://localhost/?code=abc123&state=/products/1-test/repositories/2-repo',
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
      expect(mockPush).toHaveBeenCalledWith(
        '/products/1-test/repositories/2-repo?code=abc123'
      );
    });
  });

  test('should append code with & separator when state already contains query params', async () => {
    Object.defineProperty(globalThis, 'location', {
      value: {
        search: '?code=abc123&state=/products/1-test?tab=details',
        href: 'http://localhost/?code=abc123&state=/products/1-test?tab=details',
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
      expect(mockPush).toHaveBeenCalledWith(
        '/products/1-test?tab=details&code=abc123'
      );
    });
  });

  test('should not redirect to /home when state param is present after login', async () => {
    const { getUserInfo } = require('@services/Auth');
    getUserInfo.mockResolvedValueOnce({
      type: 'success',
      value: { username: 'testuser', email: 'test@test.com' }
    });

    localStorage.setItem('token', JSON.stringify('fake-token'));

    Object.defineProperty(globalThis, 'location', {
      value: {
        search: '?state=/some/path',
        href: 'http://localhost/?state=/some/path',
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
      // Should NOT have pushed to /home because state is present
      expect(mockPush).not.toHaveBeenCalledWith('/home');
    });
  });

  test('should call signInWithGithub when code is present and provider is github', async () => {
    const { signInGithub } = require('@services/Auth');
    signInGithub.mockResolvedValueOnce({
      type: 'success',
      value: { key: 'fake-key' }
    });

    localStorage.setItem('provider', JSON.stringify('github'));

    Object.defineProperty(globalThis, 'location', {
      value: {
        search: '?code=github_code_123',
        href: 'http://localhost/?code=github_code_123',
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

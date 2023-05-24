import { useAuth } from '@contexts/Auth';
import { toast } from 'react-toastify';
import useRequireAuth from '@hooks/useRequireAuth';
import { useRouter } from 'next/router';
import { act, renderHook } from '@testing-library/react';

jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
  },
}));

const mockPush = jest.fn();
let mockPathname = '/';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@contexts/Auth', () => ({
  useAuth: jest.fn(),
}));

describe('useRequireAuth', () => {
  let mockUseAuth: any;
  let mockUseRouter: any;
  let mockConsoleError: jest.SpyInstance;

  beforeEach(() => {
    mockUseAuth = useAuth;
    mockUseRouter = useRouter;
    mockConsoleError = jest.spyOn(console, 'error');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when user is authorized', () => {
    let mockSession = {
      user: {
        id: 1,
        name: 'Fake name',
        email: 'fake@test.com',
      },
    };

    const testCases = [
      { pathname: '/products', loading: 'loaded', redirect: false, displayToast: false },
      { pathname: '/products', loading: 'loading', redirect: false, displayToast: false },
      { pathname: '/', loading: 'loaded', redirect: false, displayToast: false },
      { pathname: '/', loading: 'loading', redirect: false, displayToast: false },
    ];

    testCases.forEach(({ pathname, loading, redirect, displayToast }) => {
      describe(`when pathname is ${pathname} and loading is ${loading}`, () => {
        beforeEach(() => {
          mockUseAuth.mockReturnValueOnce({
            session: mockSession,
            loading,
          });
          mockUseRouter.mockReturnValueOnce({
            push: (path: string) => mockPush(path),
            pathname,
          });

          const { result } = renderHook(() => useRequireAuth());
    
          act(() => {
            result.current;
          });
        });

        test(`does not display toast message`, () => {
          expect(toast.error).toHaveBeenCalledTimes(displayToast ? 1 : 0);
        });

        test(`does not redirect`, () => {
          expect(mockPush).toHaveBeenCalledTimes(redirect ? 1 : 0);
        });
      });
    });
  });

  describe('when user is not authorized', () => {
    let mockSession:any = null;

    const testCases = [
      { pathname: '/products', loading: 'loaded', redirect: true, displayToast: true },
      { pathname: '/products', loading: 'loading', redirect: false, displayToast: false },
      { pathname: '/', loading: 'loaded', redirect: false, displayToast: false },
      { pathname: '/', loading: 'loading', redirect: false, displayToast: false },
      { pathname: '/productstest', loading: 'loaded', redirect: false, displayToast: true, redirectError: true },
    ];

    testCases.forEach(({ pathname, loading, redirect, displayToast, redirectError }) => {
      describe(`when pathname is ${pathname} and loading is ${loading}`, () => {
        beforeEach(() => {
          mockUseAuth.mockReturnValueOnce({
            session: mockSession,
            loading,
          });
          mockUseRouter.mockReturnValueOnce({
            push: (path: string) => {
              if (redirectError) {
                throw new Error('Redirect error');
              } else {
                mockPush(path);
              }
            },
            pathname,
          });

          const { result } = renderHook(() => useRequireAuth());
    
          act(() => {
            result.current;
          });
        });

        test(`displays toast message`, () => {
          expect(toast.error).toHaveBeenCalledTimes(displayToast ? 1 : 0);
        });

        test(`redirects`, () => {
          expect(mockPush).toHaveBeenCalledTimes(redirect ? 1 : 0);
        });

        test('logs the error to console', () => {
          expect(mockConsoleError).toHaveBeenCalledTimes(redirectError ? 1 : 0);
        });
      });
    });
  });
});

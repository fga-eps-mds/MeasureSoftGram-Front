import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthProvider } from '@contexts/Auth';
import mockRouter from 'next-router-mock';
import Auth from '../index.page';

/* eslint-disable global-require, arrow-body-style */
jest.mock('next/router', () => require('next-router-mock'));
/* eslint-enable global-require, arrow-body-style */

describe('Auth', () => {
  const originalEnv = process.env;
  const originalLocation = window.location;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_GITHUB_CLIENT_ID: 'valid-client-id',
      NEXT_PUBLIC_LOGIN_REDIRECT_URL: 'http://localhost:3000'
    };
    global.fetch = jest.fn();
    delete (window as any).location;
    window.location = {
      href: '',
      origin: 'http://localhost:3000',
      pathname: '/auth/',
      search: '',
      assign: jest.fn(),
      replace: jest.fn()
    } as any;
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

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

  describe('Origem canônica do login', () => {
    const renderAuth = () =>
      render(
        <AuthProvider>
          <Auth />
        </AuthProvider>
      );

    it('Deve recarregar /auth na origem do callback quando a origem atual for outra', () => {
      (window.location as any).origin = 'http://127.0.0.1:3000';
      (window.location as any).search = '?next=1';

      renderAuth();

      expect(window.location.replace).toHaveBeenCalledWith('http://localhost:3000/auth/?next=1');
    });

    it('Não deve redirecionar quando já estiver na origem do callback', () => {
      renderAuth();

      expect(window.location.replace).not.toHaveBeenCalled();
    });

    it('Não deve redirecionar quando a URL de callback não estiver configurada', () => {
      delete process.env.NEXT_PUBLIC_LOGIN_REDIRECT_URL;
      (window.location as any).origin = 'http://127.0.0.1:3000';

      renderAuth();

      expect(window.location.replace).not.toHaveBeenCalled();
    });
  });

  describe('Fluxo de Login do GitHub', () => {
    it('Deve redirecionar para /auth/error quando o client id for rejeitado', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ valid: false })
      });

      render(
        <AuthProvider>
          <Auth />
        </AuthProvider>
      );

      const button = screen.getByRole('button', { name: /login com github/i });
      fireEvent.click(button);

      // Wait for validation to finish and button to enable back
      await screen.findByRole('button', { name: /login com github/i });

      expect(mockRouter.asPath).toBe('/auth/error');
    });

    it('Deve redirecionar para /auth/error sem chamar a API quando o client id estiver ausente', async () => {
      delete process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;

      render(
        <AuthProvider>
          <Auth />
        </AuthProvider>
      );

      fireEvent.click(screen.getByRole('button', { name: /login com github/i }));

      await screen.findByRole('button', { name: /login com github/i });
      expect(global.fetch).not.toHaveBeenCalled();
      expect(mockRouter.asPath).toBe('/auth/error');
    });

    it('Deve redirecionar para /auth/error quando a validação falhar', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(
        <AuthProvider>
          <Auth />
        </AuthProvider>
      );

      fireEvent.click(screen.getByRole('button', { name: /login com github/i }));

      await screen.findByRole('button', { name: /login com github/i });
      expect(mockRouter.asPath).toBe('/auth/error');
      expect(window.location.assign).not.toHaveBeenCalled();
    });

    it('Deve redirecionar para a url de autorização do GitHub se o GITHUB_CLIENT_ID for válido', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ valid: true })
      });

      render(
        <AuthProvider>
          <Auth />
        </AuthProvider>
      );

      const button = screen.getByRole('button', { name: /login com github/i });
      fireEvent.click(button);

      await screen.findByRole('button', { name: /login com github/i });

      expect(window.location.assign).toHaveBeenCalledWith(expect.stringContaining('/login/oauth/authorize'));
    });
  });
});

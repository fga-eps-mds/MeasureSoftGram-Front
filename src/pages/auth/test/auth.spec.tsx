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
    process.env = { ...originalEnv };
    global.fetch = jest.fn();
    delete (window as any).location;
    window.location = { href: '', assign: jest.fn() } as any;
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

  describe('Fluxo de Login do GitHub', () => {
    it('Deve redirecionar para /auth/error quando o GITHUB_CLIENT_ID estiver ausente ou for o valor dummy', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ valid: false }),
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

    it('Deve redirecionar para a url de autorização do GitHub se o GITHUB_CLIENT_ID for válido', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ valid: true }),
      });

      render(
        <AuthProvider>
          <Auth />
        </AuthProvider>
      );

      const button = screen.getByRole('button', { name: /login com github/i });
      fireEvent.click(button);

      await screen.findByRole('button', { name: /login com github/i });

      expect(window.location.href).toContain('/login/oauth/authorize');
    });
  });
});

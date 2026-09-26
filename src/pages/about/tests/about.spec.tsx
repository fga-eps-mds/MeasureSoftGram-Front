import React from 'react';
import { render } from '@testing-library/react';
import { AuthProvider } from '@contexts/Auth';
import { useTranslation } from 'react-i18next';
import About from '../index.page';

describe('About', () => {
  describe('Snapshot', () => {
    it('Deve corresponder ao Snapshot', () => {
      // Mock o módulo react-i18next
      jest.mock('react-i18next', () => ({
        useTranslation: () => ({
          t: (key) => key, // Retorna a chave em vez de traduzir
          i18n: {
            changeLanguage: jest.fn(), // Mock da função changeLanguage
          },
        }),
      }));

      const tree = render(
        <AuthProvider>
          <About />
        </AuthProvider>
      );

      expect(tree).toMatchSnapshot();
    });
  });
});

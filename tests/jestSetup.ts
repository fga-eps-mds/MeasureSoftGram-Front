import 'jest-canvas-mock';
import '@testing-library/jest-dom';
import { webcrypto } from 'node:crypto';

// O jsdom 19 nao expoe a Web Crypto API, que o navegador expoe.
if (!globalThis.crypto?.getRandomValues) {
  Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true });
}

export const createMockedRoute = (
  query?: Object) => ({
    query,
    asPath: '/product/id',
    push: jest.fn(), // <-- Adicionado aqui
    replace: jest.fn(),
    prefetch: jest.fn().mockResolvedValue(undefined),
   } as unknown as ReturnType<typeof import('@hooks/useRouter').useRouter>);

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.fetch = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    // Adicionamos o objeto i18n mockado aqui:
    i18n: {
      language: 'pt-BR', // Simula que o idioma atual é português
      changeLanguage: jest.fn(), // Finge a função de troca sem fazer nada
    },
  }),
}));

// quem precisa de outra rota troca a implementação (ver tests/helper/router.ts) ou mocka o módulo no próprio spec
jest.mock('@hooks/useRouter', () => ({
  useRouter: jest.fn(() => createMockedRoute({ layer: undefined, product: undefined }))
}));

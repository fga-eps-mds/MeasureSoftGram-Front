import React from 'react';
import Landing from '../Landing';

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));

describe('Landing.getLayout', () => {
  it('retorna a propria pagina sem envolve-la em um layout autenticado', () => {
    const page = <div data-testid="landing-page" />;

    expect(Landing.getLayout).toBeDefined();
    expect(Landing.getLayout!(page)).toBe(page);
  });
});

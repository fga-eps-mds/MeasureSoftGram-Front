import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LandingFooter } from '../components/LandingFooter';
import { EXTERNAL_LINKS, APP_ENTRY_ROUTE } from '../constants';

const mockPush = jest.fn();

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));

describe('LandingFooter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('expoe os links externos publicos de docs e repositorios', () => {
    render(<LandingFooter />);

    const docsLink = screen.getByRole('link', { name: 'footer.docs' });
    expect(docsLink).toHaveAttribute('href', EXTERNAL_LINKS.docs);
    expect(docsLink).toHaveAttribute('target', '_blank');

    const reposLink = screen.getByRole('link', { name: 'footer.repos' });
    expect(reposLink).toHaveAttribute('href', EXTERNAL_LINKS.repositories);
    expect(reposLink).toHaveAttribute('target', '_blank');
  });

  it('o botao de entrada do rodape navega para a rota interna de acesso', () => {
    render(<LandingFooter />);

    fireEvent.click(screen.getByRole('button', { name: 'footer.enter' }));

    expect(mockPush).toHaveBeenCalledWith(APP_ENTRY_ROUTE);
  });
});

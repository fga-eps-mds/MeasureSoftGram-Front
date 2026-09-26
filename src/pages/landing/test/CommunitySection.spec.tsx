import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CommunitySection } from '../components/CommunitySection';
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

describe('CommunitySection', () => {
  const originalOpen = window.open;

  beforeEach(() => {
    jest.clearAllMocks();
    window.open = jest.fn();
  });

  afterAll(() => {
    window.open = originalOpen;
  });

  it('o card de documentacao abre o link externo de docs em nova aba', () => {
    render(<CommunitySection />);

    fireEvent.click(screen.getByRole('button', { name: 'community.docs.cta' }));

    expect(window.open).toHaveBeenCalledWith(
      EXTERNAL_LINKS.docs,
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('o card de repositorios abre a organizacao do GitHub em nova aba', () => {
    render(<CommunitySection />);

    fireEvent.click(screen.getByRole('button', { name: 'community.repos.cta' }));

    expect(window.open).toHaveBeenCalledWith(
      EXTERNAL_LINKS.repositories,
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('o card de acesso ao app navega para a rota interna de entrada', () => {
    render(<CommunitySection />);

    fireEvent.click(screen.getByRole('button', { name: 'community.app.cta' }));

    expect(mockPush).toHaveBeenCalledWith(APP_ENTRY_ROUTE);
  });
});

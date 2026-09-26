import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LandingHeader } from '../components/LandingHeader';
import { APP_ENTRY_ROUTE } from '../constants';

const mockPush = jest.fn();

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));

describe('LandingHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza os dois botoes de entrada (mobile e desktop)', () => {
    render(<LandingHeader />);

    const enterButtons = screen.getAllByRole('button', { name: 'nav.enter' });
    expect(enterButtons).toHaveLength(2);
  });

  it('cada botao de entrada navega para a rota interna de acesso', () => {
    render(<LandingHeader />);

    const enterButtons = screen.getAllByRole('button', { name: 'nav.enter' });
    enterButtons.forEach((button) => {
      fireEvent.click(button);
    });

    expect(mockPush).toHaveBeenCalledTimes(enterButtons.length);
    expect(mockPush).toHaveBeenCalledWith(APP_ENTRY_ROUTE);
  });
});

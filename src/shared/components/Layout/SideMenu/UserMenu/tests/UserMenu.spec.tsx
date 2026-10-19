import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import UserMenu from '../UserMenu';

const mockPush = jest.fn();
const mockLogout = jest.fn();

jest.mock('next/router', () => ({
  useRouter: () => ({ push: mockPush })
}));

jest.mock('@contexts/Auth', () => ({
  useAuth: () => ({ logout: mockLogout })
}));

jest.mock('@contexts/SidebarProvider/SideMenuProvider', () => ({
  useSideMenuContext: () => ({ isCollapsed: false })
}));

describe('<UserMenu />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Deve abrir o menu e navegar para as configurações', () => {
    render(<UserMenu username="testuser" />);

    fireEvent.click(screen.getByText('testuser'));
    fireEvent.click(screen.getByText('select.config'));

    expect(mockPush).toHaveBeenCalledWith('/config');
  });

  it('Deve encerrar a sessão', () => {
    render(<UserMenu username="testuser" />);

    fireEvent.click(screen.getByText('testuser'));
    fireEvent.click(screen.getByText('select.end-session'));

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});

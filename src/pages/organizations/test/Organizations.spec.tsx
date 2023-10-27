import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import Organizations from './organization.tsx';
import { useOrganizationQuery } from './hooks/useOrganizationQuery';
import { getAllUsers } from '@services/user';
import { useRouter } from 'next/router';

// Mocking useRouter hook from Next.js
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mocking useOrganizationQuery hook
jest.mock('./hooks/useOrganizationQuery', () => ({
  useOrganizationQuery: jest.fn(),
}));

// Mocking getAllUsers service
jest.mock('@services/user', () => ({
  getAllUsers: jest.fn(),
}));

describe('<Organizations />', () => {
  const mockRouterPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockRouterPush,
    });

    (useOrganizationQuery as jest.Mock).mockReturnValue({
      createOrganization: jest.fn().mockResolvedValue({ type: 'success' }),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText } = render(<Organizations />);
    expect(getByText('Cadastro de Organização')).toBeInTheDocument();
  });

  it('can fill out the form and submit', async () => {
    (getAllUsers as jest.Mock).mockResolvedValue({
      type: 'success',
      value: { results: [{ id: 1, username: 'testUser', first_name: 'Test', last_name: 'User' }] },
    });

    const { getByLabelText, getByText } = render(<Organizations />);

    const nomeInput = getByLabelText('Nome');
    const chaveInput = getByLabelText('Chave');
    const descricaoInput = getByLabelText('Descrição');

    fireEvent.change(nomeInput, { target: { value: 'Test Organization' } });
    fireEvent.change(chaveInput, { target: { value: 'TestKey' } });
    fireEvent.change(descricaoInput, { target: { value: 'Description for test' } });

    fireEvent.click(getByText('Test User (testUser)'));

    fireEvent.click(getByText('Criar'));

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith('/home');
    });
  });

});

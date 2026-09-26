import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { getAllUsers } from '@services/user';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import Organizations from '../Organizations';
import { useOrganizationQuery } from '../hooks/useOrganizationQuery';

const mockPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({ query: { id: '' }, push: mockPush })),
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@services/user', () => ({
  getAllUsers: jest.fn(),
}));

jest.mock('../hooks/useOrganizationQuery', () => ({
  useOrganizationQuery: jest.fn(),
}));

jest.mock('@contexts/OrganizationProvider', () => ({
  useOrganizationContext: jest.fn(),
}));

describe('Organizations Component', () => {
  const INPUT_SELECTOR = 'input';
  const TEXTAREA_SELECTOR = 'textarea';
  const INPUT_NAME_TEST_ID = 'input-nome';
  const INPUT_DESCRIPTION_TEST_ID = 'input-descricao';
  const ORG_EDITED_NAME = 'Org Editada';
  const ORG_EXISTING_NAME = 'Org Existente';
  const NAME_EXISTS_MESSAGE = 'toast.name-exists';
  const KEY_EXISTS_MESSAGE = 'toast.key-exists';
  const SERVER_ERROR_MESSAGE = 'server_down';
  const CREATE_SUCCESS_MESSAGE = 'toast.sucess';
  const EDIT_SUCCESS_MESSAGE = 'toast.sucess-edit';
  const GENERIC_ERROR_MESSAGE = 'toast.error';
  const GENERIC_ERROR_EDIT_MESSAGE = 'toast.error-edit';

  const mockCreateOrganization = jest.fn();
  const mockGetOrganizationById = jest.fn();
  const mockUpdateOrganization = jest.fn();

  const originalLocation = window.location;

  beforeAll(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { reload: jest.fn(), href: '' },
    });
  });

  afterAll(() => {
    Object.defineProperty(window, 'location', { configurable: true, value: originalLocation });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();

    (useRouter as jest.Mock).mockReturnValue({ push: mockPush, 
      query: {},
    });

    (useOrganizationQuery as jest.Mock).mockReturnValue({ push: mockPush, 
      createOrganization: mockCreateOrganization,
      getOrganizationById: mockGetOrganizationById,
      updateOrganization: mockUpdateOrganization,
    });

    (useOrganizationContext as jest.Mock).mockReturnValue({ push: mockPush, 
      currentOrganizations: [],
      setCurrentOrganizations: jest.fn(),
      fetchOrganizations: jest.fn(),
    });

    (getAllUsers as jest.Mock).mockResolvedValue({
      type: 'success',
      value: {
        results: [
          { id: 1, username: 'dev_ninja', first_name: 'Dev', last_name: 'Ninja' }
        ],
      },
    });
  });

  it('deve carregar usuários e exibir erro se a chamada falhar', async () => {
    (getAllUsers as jest.Mock).mockResolvedValue({ type: 'error' });
    render(<Organizations />);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('toast.load-users');
    });
  });

  it('deve carregar os dados da organização caso esteja no modo de edição', async () => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush, query: { edit: 'org-123' } });
    
    mockGetOrganizationById.mockResolvedValue({
      type: 'success',
      value: { name: ORG_EDITED_NAME, key: 'ORG', description: 'Desc', members: ['dev_ninja'] },
    });

    render(<Organizations />);

    await waitFor(() => {
      const nomeInput = screen.getByTestId(INPUT_NAME_TEST_ID).querySelector(INPUT_SELECTOR);
      expect(nomeInput?.value).toBe(ORG_EDITED_NAME);
    });

    expect(screen.getByText('title-edit')).toBeInTheDocument();
  });

  it('deve abrir o modal, adicionar/remover um usuário e fechar o modal', async () => {
    render(<Organizations />);

    await waitFor(() => {
      expect(getAllUsers).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByText('add-members'));

    const userItem = await screen.findByText('Dev Ninja (dev_ninja)');
    expect(userItem).toBeInTheDocument();

    const toggleButton = screen.getByRole('button', { name: 'Adicionar' });
    
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveTextContent('Adicionado');

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveTextContent('Adicionar');

    fireEvent.click(screen.getByText('close'));
  });

  it('deve submeter o formulário de CRIAÇÃO com sucesso', async () => {
    jest.useFakeTimers();
    mockCreateOrganization.mockResolvedValue({ type: 'success' });
    render(<Organizations />);

fireEvent.change(screen.getByTestId(INPUT_NAME_TEST_ID).querySelector(INPUT_SELECTOR)!, { target: { value: 'Nova Org' } });
      fireEvent.change(screen.getByTestId(INPUT_DESCRIPTION_TEST_ID).querySelector(TEXTAREA_SELECTOR)!, { target: { value: 'Descrição teste' } });

    fireEvent.click(screen.getByText('create'));

    await waitFor(() => {
      expect(mockCreateOrganization).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Nova Org', description: 'Descrição teste', members: [] })
      );
      expect(toast.success).toHaveBeenCalledWith(CREATE_SUCCESS_MESSAGE);
    });

    act(() => { jest.runAllTimers(); });
    expect(mockPush).toHaveBeenCalledWith('/home');
  });

  it('deve exibir erros corretos ao falhar a CRIAÇÃO', async () => {
    render(<Organizations />);

    const nomeInput = screen.getByTestId(INPUT_NAME_TEST_ID).querySelector(INPUT_SELECTOR)!;
    fireEvent.change(nomeInput, { target: { value: 'Org Falha' } });

    mockCreateOrganization.mockResolvedValueOnce({ type: 'error', error: { message: NAME_EXISTS_MESSAGE } });
    fireEvent.click(screen.getByText('create'));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(NAME_EXISTS_MESSAGE));

    mockCreateOrganization.mockResolvedValueOnce({ type: 'error', error: { message: KEY_EXISTS_MESSAGE } });
    fireEvent.click(screen.getByText('create'));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(KEY_EXISTS_MESSAGE));

    mockCreateOrganization.mockResolvedValueOnce({ type: 'error', error: { message: SERVER_ERROR_MESSAGE } });
    fireEvent.click(screen.getByText('create'));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(GENERIC_ERROR_MESSAGE));
  });

  it('deve submeter o formulário de EDIÇÃO com sucesso', async () => {
    jest.useFakeTimers();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush, query: { edit: 'org-123' } });
    
    mockGetOrganizationById.mockResolvedValue({ type: 'success', value: { name: ORG_EXISTING_NAME } });
    mockUpdateOrganization.mockResolvedValue({ type: 'success' });

    render(<Organizations />);

    await waitFor(() => {
      expect(screen.getByTestId(INPUT_NAME_TEST_ID).querySelector(INPUT_SELECTOR)?.value).toBe(ORG_EXISTING_NAME);
    });

    fireEvent.click(screen.getByText('save'));

    await waitFor(() => {
      expect(mockUpdateOrganization).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith(EDIT_SUCCESS_MESSAGE);
    });

    act(() => { jest.runAllTimers(); });
    expect(mockPush).toHaveBeenCalledWith('/home');
  });

  it('deve exibir erros corretos ao falhar a EDIÇÃO', async () => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush, query: { edit: 'org-123' } });
    
    mockGetOrganizationById.mockResolvedValue({ type: 'success', value: { name: ORG_EXISTING_NAME } });

    render(<Organizations />);

    await waitFor(() => {
      expect(screen.getByTestId(INPUT_NAME_TEST_ID).querySelector(INPUT_SELECTOR)?.value).toBe(ORG_EXISTING_NAME);
    });

    mockUpdateOrganization.mockResolvedValueOnce({ type: 'error', error: { message: NAME_EXISTS_MESSAGE } });
    fireEvent.click(screen.getByText('save'));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(NAME_EXISTS_MESSAGE));

    mockUpdateOrganization.mockResolvedValueOnce({ type: 'error', error: { message: KEY_EXISTS_MESSAGE } });
    fireEvent.click(screen.getByText('save'));
    
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(KEY_EXISTS_MESSAGE));

    mockUpdateOrganization.mockResolvedValueOnce({ type: 'error', error: { message: SERVER_ERROR_MESSAGE } });
    fireEvent.click(screen.getByText('save'));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(GENERIC_ERROR_EDIT_MESSAGE));
  });
});
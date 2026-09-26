import React from 'react';
import { render, screen, fireEvent, waitFor, createEvent } from '@testing-library/react';
import { toast } from 'react-toastify';
import { signUp } from '@services/Auth';
import { SignUpForm } from '../SignUpForm';

jest.mock('@services/Auth', () => ({
  signUp: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('SignUpForm Component', () => {
  const mockChangeAuthState = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Graças ao seu conserto, agora o getByRole e getByLabelText funcionam perfeitamente!
  const fillValidForm = () => {
    fireEvent.change(screen.getByRole('textbox', { name: /email/i }), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByRole('textbox', { name: /username/i }), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByRole('textbox', { name: /^nome/i }), { target: { value: 'John' } });
    fireEvent.change(screen.getByRole('textbox', { name: /sobrenome/i }), { target: { value: 'Doe' } });
    
    // Pegando as senhas de forma acessível pela Label vinculada!
    fireEvent.change(screen.getByLabelText(/^senha/i), { target: { value: 'Strong1Password' } });
    fireEvent.change(screen.getByLabelText(/confirmar senha/i), { target: { value: 'Strong1Password' } });
  };

  it('deve exibir erros de validação ao tentar submeter o formulário vazio', async () => {
    render(<SignUpForm changeAuthState={mockChangeAuthState} />);

    fireEvent.click(screen.getByRole('button', { name: /cadastrar/i }));

    await waitFor(() => {
      expect(screen.getByText('Email é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('Username é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('Sobrenome é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('Senha é obrigatória')).toBeInTheDocument();
      expect(screen.getByText('Confirmação de senha é obrigatória')).toBeInTheDocument();
    });
  });

  it('deve exibir erros de validação para formatos inválidos (Regex)', async () => {
    render(<SignUpForm changeAuthState={mockChangeAuthState} />);

    fireEvent.change(screen.getByRole('textbox', { name: /email/i }), { target: { value: 'email-invalido' } });
    fireEvent.change(screen.getByRole('textbox', { name: /username/i }), { target: { value: 'user space' } }); 
    
    fireEvent.change(screen.getByLabelText(/^senha/i), { target: { value: 'senhafraca' } });
    fireEvent.change(screen.getByLabelText(/confirmar senha/i), { target: { value: 'diferente' } }); 

    fireEvent.click(screen.getByRole('button', { name: /cadastrar/i }));

    await waitFor(() => {
      expect(screen.getByText('Formato de email inválido')).toBeInTheDocument();
      expect(screen.getByText('Username não pode ter espaços')).toBeInTheDocument();
      expect(screen.getByText('A senha deve conter ao menos 1 letra maiúscula, 1 número, e ter no mínimo 6 caracteres')).toBeInTheDocument();
      expect(screen.getByText('As senhas devem corresponder')).toBeInTheDocument();
    });
  });

  it('deve alternar a visibilidade da senha e prevenir o default no mouse down', () => {
    render(<SignUpForm changeAuthState={mockChangeAuthState} />);
    
    const passwordInput = screen.getByLabelText(/^senha/i) as HTMLInputElement;
    expect(passwordInput.type).toBe('password');

    const toggleButtons = screen.getAllByLabelText(/toggle.*visibility/i);
    fireEvent.click(toggleButtons[0]);

    expect(passwordInput.type).toBe('text');

    fireEvent.click(toggleButtons[0]);
    expect(passwordInput.type).toBe('password');

    const mouseDownEvent = createEvent.mouseDown(toggleButtons[0]);
    fireEvent(toggleButtons[0], mouseDownEvent);
    expect(mouseDownEvent.defaultPrevented).toBe(true);
  });

  it('deve chamar changeAuthState ao clicar no link de login', () => {
    render(<SignUpForm changeAuthState={mockChangeAuthState} />);
    
    fireEvent.click(screen.getByText('Faça login agora'));
    expect(mockChangeAuthState).toHaveBeenCalledTimes(1);
  });

  it('deve cadastrar com sucesso', async () => {
    (signUp as jest.Mock).mockResolvedValue({ type: 'success' });
    render(<SignUpForm changeAuthState={mockChangeAuthState} />);

    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: /cadastrar/i }));

    await waitFor(() => {
      expect(signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        username: 'testuser',
        first_name: 'John',
        last_name: 'Doe',
        password: 'Strong1Password',
        confirmPassword: 'Strong1Password',
      });
      expect(toast.success).toHaveBeenCalledWith('Usuário cadastrado com sucesso!');
      expect(mockChangeAuthState).toHaveBeenCalled();
    });
  });

  it('deve exibir erro 400 intuitivo quando o usuário já existe', async () => {
    (signUp as jest.Mock).mockResolvedValue({
      type: 'error',
      error: {
        response: {
          status: 400,
          data: { email: ['already exists'] }
        },
      },
    });
    
    render(<SignUpForm changeAuthState={mockChangeAuthState} />);

    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: /cadastrar/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Esse usuário já existe, tente usar um email diferente.');
    });
  });

  it('deve exibir erro genérico quando ocorrer uma falha não-400', async () => {
    (signUp as jest.Mock).mockResolvedValue({
      type: 'error',
      error: {
        message: 'Internal Server Error',
        response: { status: 500, data: {} },
      },
    });

    render(<SignUpForm changeAuthState={mockChangeAuthState} />);

    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: /cadastrar/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erro ao cadastrar usuário: Internal Server Error');
    });
  });
});

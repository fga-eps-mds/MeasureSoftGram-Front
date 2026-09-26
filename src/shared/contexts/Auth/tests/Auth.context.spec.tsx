import React from 'react';
import { render, screen, waitFor, act, fireEvent, renderHook } from '@testing-library/react';
import { getUserInfo, signInCredentials, signOut } from '@services/Auth';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { AuthProvider, useAuth } from '../Auth.context';

const localStorageMock: Record<string, any> = {};

// 1. Mock das dependências externas
jest.mock('@services/Auth', () => ({
  getUserInfo: jest.fn(),
  signInCredentials: jest.fn(),
  signInGithub: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
  },
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock simples para o ConfirmModal para focar na lógica do Contexto
jest.mock('@components/ConfirmModal/ConfirmModal', () => function MockConfirmModal({ isModalOpen, btnConfirmText, btnDismissText, handleConfirmBtnClick, handleDismissBtnClick, text }: any) {
    if (!isModalOpen) return null;
    return (
      <div data-testid="confirm-modal">
        <p>{text}</p>
        <button onClick={handleConfirmBtnClick}>{btnConfirmText}</button>
        <button onClick={handleDismissBtnClick}>{btnDismissText}</button>
      </div>
    );
  });

// Mock do hook useLocalStorage para controlar os estados internos facilmente
jest.mock('@hooks/useLocalStorage', () => ({
  useLocalStorage: jest.fn((key, initialValue) => ({
    storedValue: Object.prototype.hasOwnProperty.call(localStorageMock, key)
      ? localStorageMock[key]
      : initialValue,
    setValue: jest.fn((val) => { localStorageMock[key] = val; }),
    removeValue: jest.fn(() => { delete localStorageMock[key]; }),
  })),
}));

// 2. Componente de Teste para consumir o Contexto
const TestComponent = () => {
  const { session, signInWithCredentials, logout, loading } = useAuth();

  return (
    <div>
      <span data-testid="loading-state">{loading}</span>
      <span data-testid="session-state">{session ? 'Logado' : 'Deslogado'}</span>

      <button
        onClick={() => signInWithCredentials({ email: 'test@test.com', password: '123' })}
        data-testid="btn-login"
      >
        Login Credentials
      </button>

      <button
        onClick={() => logout()}
        data-testid="btn-logout"
      >
        Logout
      </button>
    </div>
  );
};

// 3. Suíte de Testes
describe('AuthContext', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(localStorageMock).forEach((key) => delete localStorageMock[key]);
    localStorage.clear();

    // Configuração padrão do useRouter
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      pathname: '/',
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('deve renderizar os children corretamente e iniciar com estado loaded', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Como o useEffect executa na montagem, o estado passará rapidamente para loaded
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('loaded');
    });
    expect(screen.getByTestId('session-state')).toHaveTextContent('Deslogado');
  });

  it('deve expor o hook useAuth com API correta', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    expect(result.current.session).toBeNull();
    expect(result.current.provider).toBe('credentials');
    expect(result.current.loading).toBe('loaded');
    expect(typeof result.current.setProvider).toBe('function');
    expect(typeof result.current.signInWithCredentials).toBe('function');
    expect(typeof result.current.signInWithGithub).toBe('function');
    expect(typeof result.current.logout).toBe('function');
  });

  it('deve redirecionar para o state com code quando ambos estiverem presentes', async () => {
    Object.defineProperty(globalThis, 'location', {
      value: {
        search: '?code=abc123&state=/products/1-test/repositories/2-repo',
        href: 'http://localhost/?code=abc123&state=/products/1-test/repositories/2-repo',
        pathname: '/',
      },
      writable: true,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/products/1-test/repositories/2-repo?code=abc123');
    });
  });

  it('deve adicionar & ao code quando o state já tiver query params', async () => {
    Object.defineProperty(globalThis, 'location', {
      value: {
        search: '?code=abc123&state=/products/1-test?tab=details',
        href: 'http://localhost/?code=abc123&state=/products/1-test?tab=details',
        pathname: '/',
      },
      writable: true,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/products/1-test?tab=details&code=abc123');
    });
  });

  it('não deve redirecionar para /home quando state estiver presente após login', async () => {
    (getUserInfo as jest.Mock).mockResolvedValueOnce({
      type: 'success',
      value: { username: 'testuser', email: 'test@test.com' },
    });

    localStorageMock.token = 'fake-token';

    Object.defineProperty(globalThis, 'location', {
      value: {
        search: '?state=/some/path',
        href: 'http://localhost/?state=/some/path',
        pathname: '/',
      },
      writable: true,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalledWith('/home');
    });
  });

  it('deve chamar signInWithGithub quando code estiver presente e provider for github', async () => {
    const { signInGithub } = require('@services/Auth');
    signInGithub.mockResolvedValueOnce({
      type: 'success',
      value: { key: 'fake-key' },
    });

    localStorageMock.provider = 'github';

    Object.defineProperty(globalThis, 'location', {
      value: {
        search: '?code=github_code_123',
        href: 'http://localhost/?code=github_code_123',
        pathname: '/',
      },
      writable: true,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(signInGithub).toHaveBeenCalledWith('github_code_123');
    });
  });

  it('deve realizar login com credenciais e redirecionar para /home', async () => {
    const mockUserResponse = {
      type: 'success',
      value: { key: 'fake-token', username: 'Davi' },
    };
    (signInCredentials as jest.Mock).mockResolvedValue(mockUserResponse);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginBtn = screen.getByTestId('btn-login');

    // Substitua userEvent + act por fireEvent
    fireEvent.click(loginBtn);

    await waitFor(() => {
      expect(signInCredentials).toHaveBeenCalledWith({ email: 'test@test.com', password: '123' });
      expect(toast.success).toHaveBeenCalledWith('Login realizado com sucesso!');
      expect(mockPush).toHaveBeenCalledWith('/home');
    });
  });

  it('deve exibir erro caso o login com credenciais falhe', async () => {
    (signInCredentials as jest.Mock).mockResolvedValue({
      type: 'error',
      error: { message: 'Request failed with status code 400' },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginBtn = screen.getByTestId('btn-login');

    fireEvent.click(loginBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erro ao realizar login: Erro nas credenciais');
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  it('deve realizar o logout com sucesso e redirecionar para /', async () => {
    (signOut as jest.Mock).mockResolvedValue({ type: 'success' });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const logoutBtn = screen.getByTestId('btn-logout');

    fireEvent.click(logoutBtn);

    await waitFor(() => {
      expect(signOut).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/');
      expect(toast.success).toHaveBeenCalledWith('Volte logo para acompanhar seus produtos!');
    });
  });

  describe('Temporizador de Sessão (Timers)', () => {
    let initialTime: number;

    beforeEach(() => {
      jest.useFakeTimers();

      // Fixamos o horário inicial
      initialTime = Date.now();

      // Resolve o TypeError: mockamos o retorno do getUserInfo
      (getUserInfo as jest.Mock).mockResolvedValue({ type: 'success', value: { username: 'Davi' } });

      // Resolve o Bug do modal: O timestamp deve ser uma constante, não o Date.now() dinâmico
      Storage.prototype.getItem = jest.fn((key) => {
        if (key === 'login_timestamp') return initialTime.toString();
        return null;
      });

      require('@hooks/useLocalStorage').useLocalStorage.mockImplementation((key: string) => ({
        storedValue: 'fake-data',
        setValue: jest.fn(),
        removeValue: jest.fn(),
      }));
    });

    it('deve abrir o modal de aviso quando faltar menos de 10 minutos para 2 horas', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      act(() => {
        // Avança o tempo em 1 hora e 51 minutos
        jest.advanceTimersByTime(111 * 60 * 1000);
      });

      await waitFor(() => {
        expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();
        expect(toast.warning).toHaveBeenCalledWith(
          'Sua sessão expirará em menos de 10 minutos. Salve seu trabalho para evitar perda de dados.'
        );
      });
    });

    it('deve realizar logout automático quando atingir 2 horas', async () => {
      (signOut as jest.Mock).mockResolvedValue({ type: 'success' });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      act(() => {
        // Avança o tempo em 2 horas
        jest.advanceTimersByTime(120 * 60 * 1000);
      });

      await waitFor(() => {
        expect(signOut).toHaveBeenCalled();
        expect(toast.warning).toHaveBeenCalledWith('Sua sessão expirou por segurança (limite de 2h).');
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });
  });
});

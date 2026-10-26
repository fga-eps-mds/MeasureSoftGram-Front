import React from 'react';
import { render, screen, waitFor, act, fireEvent, renderHook } from '@testing-library/react';
import { getUserInfo, signInCredentials, signOut } from '@services/Auth';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { createOAuthState, OAUTH_STATE_KEY } from '@services/Auth/oauthState';
import { AuthProvider, useAuth } from '../Auth.context';

const localStorageMock: Record<string, any> = {};

// 1. Mock das dependências externas
jest.mock('@services/Auth', () => ({
  getUserInfo: jest.fn(),
  signInCredentials: jest.fn(),
  signInGithub: jest.fn(),
  signInGitlab: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
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
  const mockReplace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(localStorageMock).forEach((key) => delete localStorageMock[key]);
    localStorage.clear();
    sessionStorage.clear();
    // Restaura a URL: testes anteriores sobrescrevem globalThis.location (code/state/error)
    Object.defineProperty(globalThis, 'location', {
      value: { search: '', href: 'http://localhost/', pathname: '/' },
      writable: true,
      configurable: true,
    });

    // Configuração padrão do useRouter
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
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

  describe('Callback do OAuth', () => {
    const setCallbackUrl = (search: string) => {
      Object.defineProperty(globalThis, 'location', {
        value: { search, href: `http://localhost/${search}`, pathname: '/' },
        writable: true,
        configurable: true,
      });
    };

    const renderProvider = () =>
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

    it('deve chamar signInWithGithub quando o state conferir com o login iniciado no GitHub', async () => {
      const { signInGithub } = require('@services/Auth');
      signInGithub.mockResolvedValueOnce({ type: 'success', value: { key: 'fake-key' } });
      setCallbackUrl(`?code=github_code_123&state=${createOAuthState('github')}`);

      renderProvider();

      await waitFor(() => {
        expect(signInGithub).toHaveBeenCalledWith('github_code_123');
      });
      expect(sessionStorage.getItem(OAUTH_STATE_KEY)).toBeNull();
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it('deve chamar signInWithGitlab quando o state conferir com o login iniciado no GitLab', async () => {
      const { signInGitlab } = require('@services/Auth');
      signInGitlab.mockResolvedValueOnce({ type: 'success', value: { key: 'fake-gitlab-key' } });
      setCallbackUrl(`?code=gitlab_code_456&state=${createOAuthState('gitlab')}`);

      renderProvider();

      await waitFor(() => {
        expect(signInGitlab).toHaveBeenCalledWith('gitlab_code_456');
      });
    });

    it('deve usar o provedor guardado no state, e não o do localStorage', async () => {
      const { signInGithub, signInGitlab } = require('@services/Auth');
      signInGithub.mockResolvedValueOnce({ type: 'success', value: { key: 'fake-key' } });
      localStorageMock.provider = 'gitlab';
      setCallbackUrl(`?code=github_code_123&state=${createOAuthState('github')}`);

      renderProvider();

      await waitFor(() => {
        expect(signInGithub).toHaveBeenCalledWith('github_code_123');
      });
      expect(signInGitlab).not.toHaveBeenCalled();
    });

    it('deve exibir o erro e limpar a sessão quando o login OAuth falhar', async () => {
      const { signInGithub } = require('@services/Auth');
      signInGithub.mockResolvedValueOnce({ type: 'error', error: new Error('código expirado') });
      localStorageMock.provider = 'github';
      setCallbackUrl(`?code=github_code_expirado&state=${createOAuthState('github')}`);

      renderProvider();

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erro ao realizar login: código expirado');
      });
      expect(localStorageMock.provider).toBeUndefined();
    });

    it.each([
      ['sem state', () => '?code=codigo_sem_state'],
      ['com state divergente', () => {
        createOAuthState('github');
        return '?code=codigo_forjado&state=forjado';
      }],
      ['com state usado como caminho', () => '?code=codigo_forjado&state=/products/1-test'],
    ])('não deve trocar o code recebido %s e deve levar a /auth/error', async (_, buildSearch) => {
      const { signInGithub, signInGitlab } = require('@services/Auth');
      localStorageMock.provider = 'github';
      setCallbackUrl(buildSearch());

      renderProvider();

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/auth/error');
      });
      expect(signInGithub).not.toHaveBeenCalled();
      expect(signInGitlab).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalledWith(expect.stringContaining('code='));
      expect(toast.error).toHaveBeenCalledWith('Não foi possível confirmar o login. Tente entrar novamente.');
      expect(sessionStorage.getItem(OAUTH_STATE_KEY)).toBeNull();
    });

    it('deve manter a sessão ativa quando o callback for rejeitado', async () => {
      (getUserInfo as jest.Mock).mockResolvedValue({
        type: 'success',
        value: { username: 'testuser', email: 'test@test.com' },
      });
      localStorageMock.token = 'fake-token';
      setCallbackUrl('?code=codigo_forjado&state=forjado');

      renderProvider();

      await waitFor(() => {
        expect(screen.getByTestId('session-state')).toHaveTextContent('Logado');
      });
      expect(mockReplace).toHaveBeenCalledWith('/auth/error');
      expect(mockPush).not.toHaveBeenCalledWith('/home');
      expect(localStorageMock.token).toBe('fake-token');
    });

    it('deve trocar o code mesmo logado e voltar à página de origem ao reautorizar', async () => {
      const { signInGithub } = require('@services/Auth');
      signInGithub.mockResolvedValueOnce({ type: 'success', value: { key: 'fake-token' } });
      (getUserInfo as jest.Mock).mockResolvedValue({
        type: 'success',
        value: { username: 'testuser', email: 'test@test.com' },
      });
      localStorageMock.token = 'fake-token';
      setCallbackUrl(`?code=github_code_reauth&state=${createOAuthState('github', '/products')}`);

      renderProvider();

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/products');
      });
      expect(signInGithub).toHaveBeenCalledWith('github_code_reauth');
      expect(mockPush).not.toHaveBeenCalledWith('/home');
    });

    it('deve exibir toast "Login cancelado" quando parâmetro error=access_denied estiver presente', async () => {
      setCallbackUrl(`?error=access_denied&error_description=Denied&state=${createOAuthState('github')}`);

      renderProvider();

      await waitFor(() => {
        expect(toast.info).toHaveBeenCalledWith('Login cancelado');
      });
      expect(sessionStorage.getItem(OAUTH_STATE_KEY)).toBeNull();
    });

    it('deve exibir erro do provedor e voltar a /auth quando a autorização falhar', async () => {
      setCallbackUrl(`?error=server_error&state=${createOAuthState('github')}`);

      renderProvider();

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth');
      });
      expect(toast.error).toHaveBeenCalledWith('Erro na autorização do provedor.');
    });

    it('deve manter a sessão e voltar à página de origem quando a reautorização for cancelada', async () => {
      (getUserInfo as jest.Mock).mockResolvedValue({
        type: 'success',
        value: { username: 'testuser', email: 'test@test.com' },
      });
      localStorageMock.token = 'fake-token';
      setCallbackUrl(`?error=access_denied&state=${createOAuthState('github', '/products')}`);

      renderProvider();

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/products');
      });
      expect(toast.info).toHaveBeenCalledWith('Login cancelado');
      expect(localStorageMock.token).toBe('fake-token');
      expect(mockPush).not.toHaveBeenCalledWith('/auth');
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

    it('deve encerrar a sessão ao escolher sair no aviso de expiração', async () => {
      (signOut as jest.Mock).mockResolvedValue({ type: 'success' });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      act(() => {
        jest.advanceTimersByTime(111 * 60 * 1000);
      });

      fireEvent.click(await screen.findByText('Sair Agora'));

      await waitFor(() => {
        expect(signOut).toHaveBeenCalled();
      });
      expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument();
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

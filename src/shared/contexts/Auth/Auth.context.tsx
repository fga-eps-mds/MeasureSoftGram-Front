import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getUserInfo, signInCredentials, signInGithub, signInGitlab, signOut } from '@services/Auth';
import { consumeOAuthState, OAuthStateContext } from '@services/Auth/oauthState';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { useLocalStorage } from '@hooks/useLocalStorage';
import ConfirmModal from '@components/ConfirmModal/ConfirmModal';

export const authContextDefaultValues: authContextType = {
  session: null,
  loading: 'loading',
  signInWithGithub: async () => ({ type: 'error', error: new Error('Implementation missing') }),
  signInWithGitlab: async () => ({ type: 'error', error: new Error('Implementation missing') }),
  signInWithCredentials: async () => ({ type: 'error', error: new Error('Implementation missing') }),
  logout: async () => { },
  provider: 'credentials',
  setProvider: () => { }
};

export const AuthContext = createContext<authContextType>(authContextDefaultValues);

const OAUTH_ERROR_PAGE = '/auth/error';
const OAUTH_REJECTED_MESSAGE = 'Não foi possível confirmar o login. Tente entrar novamente.';

export const AuthProvider = ({ children }: { children: JSX.Element }) => {
  const [loading, setLoading] = useState<'loading' | 'loaded'>('loading');
  const [isWarningOpen, setIsWarningOpen] = useState(false); // ESTADO PARA O MODAL
  const router = useRouter();
  const hasExecuted = useRef(false);
  const warningShownRef = useRef(false); // NOVO: Rastreia se o aviso já foi mostrado
  // Destino escolhido pelo callback do OAuth; enquanto existir, o getUser não leva a /home.
  const oauthRedirectRef = useRef<string | null>(null);

  const {
    storedValue: session,
    setValue: setSession,
    removeValue: removeSession
  } = useLocalStorage<Session['user'] | null>('session', null);

  const {
    storedValue: token,
    setValue: setToken,
    removeValue: removeToken
  } = useLocalStorage<Session['token'] | null>('token', null);

  const {
    storedValue: provider,
    setValue: setProvider,
    removeValue: removeProvider
  } = useLocalStorage<Providers>('provider', 'credentials');

  const removeAuthStorage = useCallback(async () => {
    removeSession();
    removeToken();
    removeProvider();
    localStorage.removeItem('login_timestamp'); // GARANTE A LIMPEZA DO TIMER
  }, [removeProvider, removeSession, removeToken]);

  const logout = useCallback(async () => {
    const response = await signOut();

    if (response.type === 'success') {
      await router.push('/');
      toast.success('Volte logo para acompanhar seus produtos!');
    }

    await removeAuthStorage();
  }, [removeAuthStorage, router]);

  const getUser = useCallback(async () => {
    const response = await getUserInfo();
    if (response.type === 'success') {
      setSession(response.value);

      if (router?.pathname === '/' && !oauthRedirectRef.current) {
        await router.push('/home');
        toast.success(`Bem vindo ao MeasureSoftGram ${response?.value?.username}!`);
      }
    } else {
      await removeAuthStorage();
    }

    setLoading('loaded');
  }, [removeAuthStorage, router, setSession]);

  const signInWithOAuth = useCallback(
    async (signIn: typeof signInGithub, code: string): Promise<Result<User>> => {
      const response = await signIn(code);

      if (response.type === 'success' && response?.value?.key) {
        setToken(response.value.key);
        localStorage.setItem('login_timestamp', Date.now().toString()); // MARCA O INÍCIO DA SESSÃO
        toast.success('Login realizado com sucesso!');

        return {
          type: 'success',
          value: {
            key: response.value.key,
            username: '',
            first_name: '',
            last_name: '',
            email: '',
            avatar_url: '',
            repos_url: '',
            organizations_url: ''
          }
        };
      }

      if (response.type === 'error') {
        void removeAuthStorage();
        toast.error(`Erro ao realizar login: ${response.error.message || 'Erro desconhecido'}`);
        return response;
      }

      return { type: 'error', error: new Error('Erro desconhecido') };
    },
    [removeAuthStorage, setToken]
  );

  const signInWithGithub = useCallback((code: string) => signInWithOAuth(signInGithub, code), [signInWithOAuth]);

  const signInWithGitlab = useCallback((code: string) => signInWithOAuth(signInGitlab, code), [signInWithOAuth]);

  const signInWithCredentials = useCallback(
    async (data: LoginFormData): Promise<Result<User>> => {
      setProvider('credentials');
      const response = await signInCredentials(data);

      if (response.type === 'success' && response?.value?.key) {
        setToken(response.value.key);
        localStorage.setItem('login_timestamp', Date.now().toString()); // MARCA O INÍCIO DA SESSÃO
        toast.success('Login realizado com sucesso!');
        await router.push('/home');
        return response;
      }
      if (response.type === 'error') {
        toast.error(`Erro ao realizar login: ${response.error.message === 'Request failed with status code 400' ? 'Erro nas credenciais' : response.error.message || 'Erro desconhecido'}`);
        return response;
      }

      return { type: 'error', error: new Error('Erro desconhecido') };
    },
    [router, setProvider, setToken]
  );


useEffect(() => {
    const checkSessionTime = () => {
      const loginTime = localStorage.getItem('login_timestamp');

      // Só monitora se o usuário tiver feito login
      if (!loginTime || (!session && !token)) return;

      const limitMs = 2 * 60 * 60 * 1000; // 2 horas
      const warningMs = limitMs - (10 * 60 * 1000); // 1h e 50min
      const now = Date.now();
      const elapsed = now - parseInt(loginTime);

      // Passou de 2 horas -> Logout automático
      if (elapsed >= limitMs) {
        void logout();
        warningShownRef.current = false;
        setIsWarningOpen(false);
        toast.warning('Sua sessão expirou por segurança (limite de 2h).');
      }
      // Aviso apenas UMA VEZ quando atingir o tempo limite
      else if (elapsed >= warningMs && !warningShownRef.current) {
        warningShownRef.current = true;
        setIsWarningOpen(true);
        toast.warning('Sua sessão expirará em menos de 10 minutos. Salve seu trabalho para evitar perda de dados.');
      }
    };

    checkSessionTime();

    // Checa a condição a cada 1 minuto para o caso do usuário ficar ocioso
    const interval = setInterval(checkSessionTime, 60000);

    return () => clearInterval(interval);
  }, [logout, session, token]);
  const handleOAuthError = useCallback(
    async (error: string, oauthState: OAuthStateContext | null) => {
      if (error === 'access_denied') {
        toast.info('Login cancelado');
      } else {
        toast.error('Erro na autorização do provedor.');
      }

      // Reautorização cancelada: a sessão continua e o usuário volta para onde estava.
      if (oauthState?.returnTo) {
        oauthRedirectRef.current = oauthState.returnTo;
        await router.replace(oauthState.returnTo);
        return;
      }

      oauthRedirectRef.current = '/auth';
      await removeAuthStorage();
      if (router?.pathname !== '/auth') {
        await router.push('/auth');
      }
    },
    [removeAuthStorage, router]
  );

  // O code não foi pedido por esta aba (state ausente, divergente ou expirado): não chega ao Service.
  const rejectOAuthCallback = useCallback(async () => {
    oauthRedirectRef.current = OAUTH_ERROR_PAGE;
    toast.error(OAUTH_REJECTED_MESSAGE);
    await router.replace(OAUTH_ERROR_PAGE);
  }, [router]);

  const completeOAuthCallback = useCallback(
    async (code: string, oauthState: OAuthStateContext) => {
      // Sem returnTo (login), quem leva a /home é o getUser, como no login por credenciais.
      oauthRedirectRef.current = oauthState.returnTo;
      const signIn = oauthState.provider === 'gitlab' ? signInWithGitlab : signInWithGithub;
      const response = await signIn(code);

      if (response.type === 'success' && oauthState.returnTo) {
        await router.replace(oauthState.returnTo);
      }
    },
    [router, signInWithGithub, signInWithGitlab]
  );

  useEffect(() => {
    if (hasExecuted.current) return;

    const params = new URLSearchParams(globalThis.location.search);
    const code = params.get('code');
    const error = params.get('error');
    if (!code && !error) return;

    hasExecuted.current = true;
    // Todo retorno do provedor consome o state, inclusive o cancelamento.
    const oauthState = consumeOAuthState(params.get('state'));

    if (error) {
      void handleOAuthError(error, oauthState);
    } else if (oauthState) {
      void completeOAuthCallback(code as string, oauthState);
    } else {
      void rejectOAuthCallback();
    }
  }, [completeOAuthCallback, handleOAuthError, rejectOAuthCallback]);

  useEffect(() => {
    setLoading('loading');

    if (token) void getUser();
    else setLoading('loaded');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const value = useMemo(
    () => ({
      session,
      logout,
      signInWithCredentials,
      signInWithGithub,
      signInWithGitlab,
      provider: provider!,
      setProvider,
      loading
    }),
    [logout, provider, session, setProvider, signInWithCredentials, signInWithGithub, signInWithGitlab, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      {/* NOVO: Modal que será exibido aos 1h50 de sessão */}
      <ConfirmModal
        isModalOpen={isWarningOpen}
        setIsModalOpen={setIsWarningOpen}
        text="Sua sessão expirará em menos de 10 minutos. Salve seu trabalho para evitar perda de dados."
        btnConfirmText="Entendi"
        btnDismissText="Sair Agora"
        handleConfirmBtnClick={() => setIsWarningOpen(false)}
        handleDismissBtnClick={() => {
          setIsWarningOpen(false);
          void logout();
        }}
      />
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within a AuthProvider');
  }

  return context;
}

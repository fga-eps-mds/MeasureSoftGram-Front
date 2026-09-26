import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getUserInfo, signInCredentials, signInGithub, signOut } from '@services/Auth';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { useLocalStorage } from '@hooks/useLocalStorage';
import ConfirmModal from '@components/ConfirmModal/ConfirmModal';

export const authContextDefaultValues: authContextType = {
  session: null,
  loading: 'loading',
  signInWithGithub: async () => ({ type: 'error', error: new Error('Implementation missing') }),
  signInWithCredentials: async () => ({ type: 'error', error: new Error('Implementation missing') }),
  logout: async () => { },
  provider: 'credentials',
  setProvider: () => { }
};

export const AuthContext = createContext<authContextType>(authContextDefaultValues);

export const AuthProvider = ({ children }: { children: JSX.Element }) => {
  const [loading, setLoading] = useState<'loading' | 'loaded'>('loading');
  const [isWarningOpen, setIsWarningOpen] = useState(false); // ESTADO PARA O MODAL
  const router = useRouter();
  const hasExecuted = useRef(false);
  const warningShownRef = useRef(false); // NOVO: Rastreia se o aviso já foi mostrado
  const hasRedirected = useRef(false);

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

      const params = new URLSearchParams(globalThis.location.search);
      const state = params.get('state');

      // Se estamos na raiz mas viemos com um "state" do GitHub, não redirecione para a home,
      // pois o outro useEffect vai cuidar de redirecionar para o local correto.
      if (router?.pathname === '/' && !state) {
        await router.push('/home');
        toast.success(`Bem vindo ao MeasureSoftGram ${response?.value?.username}!`);
      }
    } else {
      await removeAuthStorage();
    }

    setLoading('loaded');
  }, [removeAuthStorage, router, setSession]);

  const signInWithGithub = useCallback(
    async (code: string): Promise<Result<User>> => {
      const response = await signInGithub(code);

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
        removeAuthStorage();
        toast.error(`Erro ao realizar login: ${response.error.message || 'Erro desconhecido'}`);
        return response;
      }

      return { type: 'error', error: new Error('Erro desconhecido') };
    },
    [removeAuthStorage, setToken]
  );

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
        logout();
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
  useEffect(() => {
    const params = new URLSearchParams(globalThis.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (code && state && state.startsWith('/') && !hasRedirected.current) {
      hasRedirected.current = true;
      const separator = state.includes('?') ? '&' : '?';
      router.push(`${state}${separator}code=${code}`);
      return;
    }

    if (code && provider === 'github' && !token && !hasExecuted.current) {
      hasExecuted.current = true;
      signInWithGithub(code as string);
    }
  }, [provider, token, signInWithGithub, router]);

  useEffect(() => {
    setLoading('loading');

    if (token) getUser();
    else setLoading('loaded');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const value = useMemo(
    () => ({
      session,
      logout,
      signInWithCredentials,
      signInWithGithub,
      provider: provider!,
      setProvider,
      loading
    }),
    [logout, provider, session, setProvider, signInWithCredentials, signInWithGithub, loading]
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
          logout();
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

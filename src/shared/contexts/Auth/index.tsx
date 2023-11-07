import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getUserInfo, signInCredentials, signInGithub, signOut } from '@services/Auth';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { useLocalStorage } from '@hooks/useLocalStorage';

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
  const router = useRouter();

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
      if (router?.pathname === '/') {
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
            organizations_url: '',
          }
        };
      } else if (response.type === 'error') {
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
        toast.success('Login realizado com sucesso!');
        await router.push('/home');
        return response;
      } else if (response.type === 'error') {
        toast.error(`Erro ao realizar login: ${response.error.message || 'Erro desconhecido'}`);
        return response;
      }

      return { type: 'error', error: new Error('Erro desconhecido') };
    },
    [router, setProvider, setToken]
  );


  useEffect(() => {
    const code = router?.query?.code;
    if (code && provider === 'github') {
      signInWithGithub(code as string);
    }
  }, [provider, router?.query?.code, signInWithGithub]);

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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within a AuthProvider');
  }

  return context;
}

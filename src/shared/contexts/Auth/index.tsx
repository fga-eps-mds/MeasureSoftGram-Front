import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getUserInfo, signInGithub, signOut } from '@services/Auth';
import { signIn } from 'next-auth/react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { useLocalStorage } from '@hooks/useLocalStorage';

export const authContextDefaultValues: authContextType = {
  session: null,
  signIn: async () => ({} as Result<User>),
  signInWithGithub: async () => ({} as Result<User>),
  logout: async () => ({} as Promise<void>),
  provider: 'credentials',
  setProvider: async () => ({})
};

export const AuthContext = createContext<authContextType>(authContextDefaultValues);

export const AuthProvider = ({ children }: { children: JSX.Element }) => {
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
  } = useLocalStorage<Providers | null>('provider', null);

  const removeAuthStorage = useCallback(() => {
    removeSession();
    removeToken();
    removeProvider();
  }, [removeProvider, removeSession, removeToken]);
  const logout = useCallback(async () => {
    const response = await signOut();

    if (response.type === 'success') {
      toast.success('Logout realizado com sucesso');
    } else {
      toast.error('Erro ao realizar logout');
      removeAuthStorage();
    }
  }, [removeAuthStorage]);
  const router = useRouter();

  const getUser = useCallback(async () => {
    const response = await getUserInfo();
    if (response.type === 'success') {
      setSession(response.value);
      toast.success(`Bem vindo ao MeasureSoftGram ${response?.value?.username}!`);
      router.push('/products/');
    } else {
      removeAuthStorage();
    }
  }, [removeAuthStorage, router, setSession]);

  const signInWithGithub = useCallback(
    async (code: string) => {
      const response = await signInGithub(code);

      if (response.type === 'success') {
        setToken(response?.value?.key);
      }
      // removeAuthStorage();
      // toast.error(`Erro ao realizar login: ${response?.error?.message}`);
    },
    [setToken]
  );
  useEffect(() => {
    const code = router?.query?.code;
    if (code && provider === 'github') {
      signInWithGithub(code as string);
    }
  }, [provider, router?.query?.code, signInWithGithub]);

  useEffect(() => {
    if (token) getUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const value = useMemo(
    () => ({
      session,
      logout,
      signIn,
      signInWithGithub,
      provider,
      setProvider
    }),
    [logout, provider, session, setProvider, signInWithGithub]
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

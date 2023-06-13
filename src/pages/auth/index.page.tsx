import React, { ReactElement, useCallback, useState } from 'react';
import { NextPageWithLayout } from '@pages/_app.next';
import { Button } from '@mui/material';
import { GitHub } from '@mui/icons-material';
import { getGithubAuthUrl } from '@services/Auth';
import { useRouter } from 'next/router';
import { useAuth } from '@contexts/Auth';
import { AuthLayout } from '@layouts/auth';
import { AuthHeader } from './components/AuthHeader';
import { AuthFooter } from './components/AuthFooter';
import { SignInForm } from './components/SignInForm';
import { SignUpForm } from './components/SignUpForm';

type AuthState = 'signin' | 'signup';

const Auth: NextPageWithLayout = () => {
  const [authState, setAuthState] = useState<AuthState>('signin');

  const changeAuthState = useCallback((state: AuthState) => () => setAuthState(state), []);
  const router = useRouter();
  const { setProvider } = useAuth();
  return (
    <AuthLayout
      header={
        {
          signin: (
            <AuthHeader
              title="Login"
              subTitle="Ou utilize o Email"
              loginButton={
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<GitHub />}
                  onClick={() => {
                    void router.push(getGithubAuthUrl(), undefined, { shallow: true });
                    setProvider('github');
                  }}
                >
                  Login com Github
                </Button>
              }
            />
          ),
          signup: (
            <AuthHeader
              title="Cadastro"
              subTitle="Ou utilize o Email"
              loginButton={
                <Button fullWidth variant="outlined" startIcon={<GitHub />}>
                  Cadastro com Github
                </Button>
              }
            />
          )
        }[authState]
      }
      footer={
        {
          signin: (
            <AuthFooter
              text="Ainda não tem cadastro?"
              link="Crie agora uma conta"
              changeAuthState={changeAuthState('signup')}
            />
          ),
          signup: (
            <AuthFooter text="Já possui conta?" link="Faça login agora" changeAuthState={changeAuthState('signin')} />
          )
        }[authState]
      }
    >
      {
        {
          signin: <SignInForm />,
          signup: <SignUpForm changeAuthState={changeAuthState('signin')} />
        }[authState]
      }
    </AuthLayout>
  );
};

Auth.getLayout = function getLayout(page: ReactElement) {
  return page;
};

export default Auth;
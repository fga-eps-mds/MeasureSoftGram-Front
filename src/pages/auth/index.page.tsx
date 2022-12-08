import React, { ReactElement, useCallback, useState } from 'react';
import { NextPageWithLayout } from '@pages/_app.next';
import { AuthLayout } from 'src/shared/Layout';
import { Button } from '@mui/material';
import { GitHub } from '@mui/icons-material';
import { AuthHeader } from './components/AuthHeader';
import { AuthFooter } from './components/AuthFooter';
import { SignInForm } from './components/SignInForm';

type AuthState = 'signin' | 'signup';

const Auth: NextPageWithLayout = () => {
  const [authState, setAuthState] = useState<AuthState>('signin');

  const changeAuthState = useCallback((state: AuthState) => () => setAuthState(state), []);

  return (
    <AuthLayout
      header={
        {
          signin: (
            <AuthHeader
              title="Login"
              subTitle="Ou utilize o Email"
              loginButton={
                <Button variant="outlined" startIcon={<GitHub />}>
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
                <Button variant="outlined" startIcon={<GitHub />}>
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
          signup: <SignInForm />
        }[authState]
      }
    </AuthLayout>
  );
};

Auth.getLayout = function getLayout(page: ReactElement) {
  return page;
};

export default Auth;

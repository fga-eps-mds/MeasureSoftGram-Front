import React, { ReactElement, useEffect, useState } from 'react';
import { NextPageWithLayout } from '@pages/_app.next';
import { Button, Box, Typography, CircularProgress } from '@mui/material';
import { GitHub } from '@mui/icons-material';
import { FaGitlab } from 'react-icons/fa';
import { getGithubAuthUrl, getGitlabAuthUrl, getLoginOrigin } from '@services/Auth';
import { createOAuthState } from '@services/Auth/oauthState';
import { useRouter } from 'next/router';
import { useAuth } from '@contexts/Auth';
import { AuthLayout } from '@layouts/auth';
import Image from 'next/image';
import logoImage from '@public/images/svg/logo.svg';

const PRIMARY_MAIN = 'primary.main';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

type OAuthProvider = 'github' | 'gitlab';

const Auth: NextPageWithLayout = () => {
  const router = useRouter();
  const { setProvider } = useAuth();
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(null);

  // O GitHub sempre volta para a origem do callback; o provider salvo no
  // localStorage de outra origem (ex.: localhost x 127.0.0.1) se perderia.
  useEffect(() => {
    const loginOrigin = getLoginOrigin();
    if (loginOrigin && loginOrigin !== window.location.origin) {
      window.location.replace(`${loginOrigin}${window.location.pathname}${window.location.search}`);
    }
  }, []);

  // Valida o client id no Service antes de sair para o provedor; qualquer
  // falha leva a /auth/error em vez de um redirecionamento invalido.
  const startOAuthLogin = async (provider: OAuthProvider, clientId: string | undefined, getAuthUrl: typeof getGithubAuthUrl) => {
    setLoadingProvider(provider);
    try {
      if (!clientId) {
        await router.push('/auth/error');
        return;
      }

      const response = await fetch(`${API_URL}/v1/accounts/${provider}/validate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ client_id: clientId })
      });
      if (!response.ok) {
        throw new Error(`${provider} OAuth validation failed with status ${response.status}`);
      }
      const data = await response.json();
      if (!data?.valid) {
        await router.push('/auth/error');
        return;
      }
      const state = createOAuthState(provider);
      setProvider(provider);
      window.location.assign(getAuthUrl(state));
    } catch (err) {
      await router.push('/auth/error');
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <AuthLayout>
      <Box display="flex" flexDirection="column" alignItems="center" gap="1.5rem">
        <Box sx={{ width: '60px', height: '60px', marginBottom: '0.5rem' }}>
          <Image src={logoImage} alt="Logo Measure" style={{ width: '100%', height: 'auto' }} />
        </Box>

        <Box textAlign="center" marginBottom="0.5rem">
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            MeasureSoftGram
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Venha conferir a saúde do seu produto de software
          </Typography>
        </Box>

        <Button
          fullWidth
          variant="outlined"
          size="large"
          startIcon={
            loadingProvider === 'github' ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <GitHub />
            )
          }
          disabled={loadingProvider !== null}
          onClick={() => startOAuthLogin('github', process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID, getGithubAuthUrl)}
          sx={{
            py: 1.5,
            fontSize: '1rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            color: PRIMARY_MAIN,
            borderColor: PRIMARY_MAIN,
            backgroundColor: '#fff',
            borderWidth: '1px',
            '&:hover': {
              backgroundColor: 'rgba(43, 77, 111, 0.08)',
              borderColor: PRIMARY_MAIN,
              borderWidth: '1px'
            }
          }}
        >
          {loadingProvider === 'github' ? 'Validando...' : 'LOGIN COM GITHUB'}
        </Button>

        <Button
          fullWidth
          variant="outlined"
          size="large"
          startIcon={
            loadingProvider === 'gitlab' ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <FaGitlab size={22} color="#fc6d26" />
            )
          }
          disabled={loadingProvider !== null}
          onClick={() => startOAuthLogin('gitlab', process.env.GITLAB_CLIENT_ID, getGitlabAuthUrl)}
          sx={{
            py: 1.5,
            fontSize: '1rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            color: '#fc6d26',
            borderColor: '#fc6d26',
            backgroundColor: '#fff',
            borderWidth: '1px',
            '&:hover': {
              backgroundColor: 'rgba(252, 109, 38, 0.08)',
              borderColor: '#fc6d26',
              borderWidth: '1px',
            },
          }}
        >
          {loadingProvider === 'gitlab' ? 'Validando...' : 'LOGIN COM GITLAB'}
        </Button>
      </Box>
    </AuthLayout>
  );
};

Auth.getLayout = function getLayout(page: ReactElement) {
  return page;
};

export default Auth;

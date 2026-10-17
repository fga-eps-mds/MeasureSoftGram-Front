import React, { ReactElement, useState } from 'react';
import { NextPageWithLayout } from '@pages/_app.next';
import { Button, Box, Typography, CircularProgress } from '@mui/material';
import { GitHub } from '@mui/icons-material';
import { FaGitlab } from 'react-icons/fa';
import { getGithubAuthUrl, getGitlabAuthUrl } from '@services/Auth';
import { useRouter } from 'next/router';
import { useAuth } from '@contexts/Auth';
import { AuthLayout } from '@layouts/auth';
import Image from 'next/image';
import logoImage from '@public/images/svg/logo.svg';

const PRIMARY_MAIN = 'primary.main';

const Auth: NextPageWithLayout = () => {
  const router = useRouter();
  const { setProvider } = useAuth();
  const [loadingProvider, setLoadingProvider] = useState<'github' | 'gitlab' | null>(null);

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
          onClick={async () => {
            setLoadingProvider('github');
            try {
              const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/v1/accounts/github/validate/`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ client_id: process.env.GITHUB_CLIENT_ID }),
                }
              );
              const data = await response.json();
              if (data && data.valid === false) {
                router.push('/auth/error');
                return;
              }
              window.location.href = getGithubAuthUrl();
              setProvider('github');
            } catch (err) {
              window.location.href = getGithubAuthUrl();
              setProvider('github');
            } finally {
              setLoadingProvider(null);
            }
          }}
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
              borderWidth: '1px',
            },
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
          onClick={async () => {
            setLoadingProvider('gitlab');
            try {
              const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/v1/accounts/gitlab/validate/`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ client_id: process.env.GITLAB_CLIENT_ID }),
                }
              );
              const data = await response.json();
              if (data && data.valid === false) {
                router.push('/auth/error');
                return;
              }
              window.location.href = getGitlabAuthUrl();
              setProvider('gitlab');
            } catch (err) {
              window.location.href = getGitlabAuthUrl();
              setProvider('gitlab');
            } finally {
              setLoadingProvider(null);
            }
          }}
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

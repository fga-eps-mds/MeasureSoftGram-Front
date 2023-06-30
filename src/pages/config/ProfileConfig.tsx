import useRequireAuth from '@hooks/useRequireAuth';
import { NextPageWithLayout } from '@pages/_app.next';
import Head from 'next/head';
import { getLayout } from '@components/Layout/getLayout';
import { Container, TextField, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff, ContentCopy } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { getAccessToken } from '@services/Auth';

const ProfileConfig: NextPageWithLayout = () => {
  useRequireAuth();

  const [tokenVisible, setTokenVisible] = useState(false);
  const [apiToken, setApiToken] = useState('');

  useEffect(() => {
    getAccessToken().then((res) => {
      if (res.type === 'success') {
        setApiToken(`Token ${res.value.key}`); // Changed to use template literals
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleVisibility = () => {
    setTokenVisible(!tokenVisible);
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(apiToken);
  };

  return (
    <>
      <Head>
        <title>Config</title>
      </Head>
      <Container>
        <h1>Configurações</h1>

        <h3 style={{ textAlign: 'left' }}>Chave secreta para acesso à API</h3>
        <TextField
          style={{ textAlign: 'center' }}
          type={tokenVisible ? 'text' : 'password'}
          value={apiToken}
          label="Chave secreta"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton aria-label="toggle password visibility" onClick={handleToggleVisibility}>
                  {tokenVisible ? <VisibilityOff /> : <Visibility />}
                </IconButton>
                <IconButton aria-label="copy api token" onClick={handleCopyToken}>
                  <ContentCopy />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Container>
    </>
  );
};

ProfileConfig.getLayout = getLayout;

export default ProfileConfig;

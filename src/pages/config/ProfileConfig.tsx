import useRequireAuth from '@hooks/useRequireAuth';
import { NextPageWithLayout } from '@pages/_app.next';
import Head from 'next/head';
import { getLayout } from '@components/Layout/getLayout';
import { Container, TextField, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useState } from 'react';

const ProfileConfig: NextPageWithLayout = () => {
  useRequireAuth();

  const [tokenVisible, setTokenVisible] = useState(false);
  const apiToken = 'YourAPIToken'; // replace with your actual token

  const handleToggleVisibility = () => {
    setTokenVisible(!tokenVisible);
  };

  return (
    <>
      <Head>
        <title>Config</title>
      </Head>
      <Container>
        <h1>Configurações</h1>

        <h3>Chave secreta para acesso à API</h3>
        <TextField
          type={tokenVisible ? 'text' : 'password'}
          value={apiToken}
          label="Chave secreta"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton aria-label="toggle password visibility" onClick={handleToggleVisibility}>
                  {tokenVisible ? <VisibilityOff /> : <Visibility />}
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

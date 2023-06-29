import useRequireAuth from '@hooks/useRequireAuth';
import { NextPageWithLayout } from '@pages/_app.next';
import Head from 'next/head';
import { getLayout } from '@components/Layout/getLayout';
import { Container } from '@mui/material';

const ProfileConfig: NextPageWithLayout = () => {
  useRequireAuth();

  return (
    <>
      <Head>
        <title>Config</title>
      </Head>
      <Container>
        <h1>Configurações</h1>
      </Container>
    </>
  );
};

ProfileConfig.getLayout = getLayout;

export default ProfileConfig;

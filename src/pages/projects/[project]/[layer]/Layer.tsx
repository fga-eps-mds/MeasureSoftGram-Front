import React from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { Container } from '@mui/material';

import Layout from '@components/Layout';

import SwitchLayer from './SwitchLayer';

const Layer: NextPage = () => {
  const { query } = useRouter();

  const { layer } = query;

  return (
    <Layout>
      <Head>
        <title>MeasureSoftGram - Projetos</title>
      </Head>

      <Container>
        <SwitchLayer layer={layer as string} />
      </Container>
    </Layout>
  );
};

export default Layer;

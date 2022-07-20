import React from 'react';
import type { NextPage } from 'next';
import { useRouter,  } from 'next/router';
import Head from 'next/head';

import { Container } from '@mui/material';

import Layout from '@components/Layout';
import TabSwitch from '../components/TabSwitch';

const Layer: NextPage = () => {
  const {
    query: { layer }
  } = useRouter();

  return (
    <Layout>
      <Head>
        <title>MeasureSoftGram - Projetos</title>
      </Head>

      <Container>
        <TabSwitch layer={layer}/>
      </Container>
    </Layout>
  );
}
export default Layer;

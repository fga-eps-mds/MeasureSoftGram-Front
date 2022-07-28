import React from 'react';
import Head from 'next/head';

import { Container } from '@mui/material';

import { NextPageWithLayout } from '@pages/_app.next';
import getLayout from '@components/Layout';

const Measure: NextPageWithLayout = () => {
  // const resultMock = {
  //   id: 1,
  //   name: '2022-1-MeasureSoftGram-Front-Medidas',
  //   description: 'Repositório Frontend do software MeasureSoftGram.',
  //   github_url: 'https://github.com/fga-eps-mds/2022-1-MeasureSoftGram-Front',
  //   created_at: '2022-07-14T020:00:55.603466',
  //   updated_at: '2022-07-15T08:58:55.603466'
  // };

  // const lastUpdateDate = formatRelative(new Date(resultMock.updated_at), new Date(), {
  //   locale: ptBR
  // });

  return (
    <>
      <Head>
        <title>MeasureSoftGram - Projetos</title>
      </Head>

      <Container>{/* <TabSwitch layer={layer}/> */}</Container>
    </>
  );
};

Measure.getLayout = getLayout;

export default Measure;

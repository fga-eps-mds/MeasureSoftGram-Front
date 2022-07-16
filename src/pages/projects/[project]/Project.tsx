import React from 'react';

import type { NextPage } from 'next';
import Head from 'next/head';

import { Box, Container } from '@mui/material';

import Layout from '@components/Layout';

import ProjectContent from './components/ProjectContent';

const Project: NextPage = () => (
  <Layout>
    <Head>
      <title>MeasureSoftGram - Projetos</title>
    </Head>

    <Container>
      <Box>
        <ProjectContent />
      </Box>
    </Container>
  </Layout>
);

export default Project;

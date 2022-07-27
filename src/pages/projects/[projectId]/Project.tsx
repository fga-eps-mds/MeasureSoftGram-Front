import React from 'react';

import type { NextPage } from 'next';
import Head from 'next/head';

import { Box, Container } from '@mui/material';

import Layout from '@components/Layout';

import ProjectContent from '../../../shared/components/ProjectContent';
import useQuery from '@hooks/useQuery';

const Project: NextPage = () => {
  const { project } = useQuery();

  return (
    <Layout>
      <Head>
        <title>MeasureSoftGram - Projetos</title>
      </Head>

      <Container>
        <Box>
          <ProjectContent project={project} />
        </Box>
      </Container>
    </Layout>
  );
};

export default Project;

import React from 'react';

import Head from 'next/head';

import { Box, Container } from '@mui/material';

import { NextPageWithLayout } from '@pages/_app.next';

import getLayout from '@components/Layout';

import { useQuery } from './hooks/useQuery';
import ProjectContent from '../components/ProjectContent';

const Project: NextPageWithLayout = () => {
  const { project, repositoriesSqcHistory } = useQuery();

  return (
    <>
      <Head>
        <title>MeasureSoftGram - Projetos</title>
      </Head>

      <Container>
        <Box>
          <ProjectContent
            project={project}
            repositoriesSqcHistory={repositoriesSqcHistory}
          />
        </Box>
      </Container>
    </>
  );
};

Project.getLayout = getLayout;

export default Project;

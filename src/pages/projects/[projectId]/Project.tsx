import React from 'react';

import Head from 'next/head';

import { Box, Container } from '@mui/material';

import { NextPageWithLayout } from '@pages/_app';

import useQuery from '@hooks/useQuery';

import getLayout from '@components/Layout';
import ProjectContent from '../components/ProjectContent';

const Project: NextPageWithLayout = () => {
  const { project } = useQuery();

  return (
    <>
      <Head>
        <title>MeasureSoftGram - Projetos</title>
      </Head>

      <Container>
        <Box>
          <ProjectContent project={project} />
        </Box>
      </Container>
    </>
  );
};

Project.getLayout = getLayout;

export default Project;

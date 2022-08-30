import React from 'react';
import Head from 'next/head';

import { Box, Container, Typography } from '@mui/material';

import { NextPageWithLayout } from '@pages/_app.next';

import getLayout from '@components/Layout';
import CardNavigation from '@components/CardNavigation';

const Projects: NextPageWithLayout = () => {
  const resultMock = [
    {
      id: 3,
      name: '2022-1-MeasureSoftGram-Front'
    }
  ];

  return (
    <>
      <Head>
        <title>MeasureSoftGram - Projetos</title>
      </Head>

      <Container>
        <Box display="flex" flexDirection="column">
          <Box marginY="60px">
            <Typography variant="h5">Projetos</Typography>
          </Box>

          <Box display="flex">
            {resultMock.map((project) => (
              <CardNavigation key={project.id} id={project.id} name={project.name} url={`/projects/${project.id}`} />
            ))}
          </Box>
        </Box>
      </Container>
    </>
  );
};

Projects.getLayout = getLayout;

export default Projects;

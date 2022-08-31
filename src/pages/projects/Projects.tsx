import React, { useState } from 'react';
import Head from 'next/head';

import { Box, Container, Typography } from '@mui/material';

import { NextPageWithLayout } from '@pages/_app.next';

import getLayout from '@components/Layout';
import CardNavigation from '@components/CardNavigation';
import ConfigPage from '@pages/preConfig/ConfigPage';

const Projects: NextPageWithLayout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const resultMock = [
    {
      id: 1,
      name: '2022-1-MeasureSoftGram-Front'
    }
  ];

  return (
    <>
      <Head>
        <title>MeasureSoftGram - Projetos</title>
      </Head>
      <Container>
        <ConfigPage isOpen={isOpen} onClose={setIsOpen} repoName={resultMock[0].name} />
        <Box display="flex" flexDirection="column">
          <Box marginY="60px">
            <Typography variant="h5">Projetos</Typography>
          </Box>
          <Box display="flex">
            {resultMock.map((project) => (
              <CardNavigation
                key={project.id}
                id={project.id}
                name={project.name}
                url={`/projects/${project.id}`}
                onClickMoreVert={() => setIsOpen(true)}
              />
            ))}
          </Box>
        </Box>
      </Container>
    </>
  );
};

Projects.getLayout = getLayout;

export default Projects;

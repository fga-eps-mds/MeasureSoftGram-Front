import React, { useState } from 'react';
import Head from 'next/head';

import { Box, Container, IconButton, Typography } from '@mui/material';

import { NextPageWithLayout } from '@pages/_app.next';

import getLayout from '@components/Layout';
import CardNavigation from '@components/CardNavigation';
import ConfigPage from '@pages/preConfig/ConfigPage';
import { MoreVert } from '@mui/icons-material';

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
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <CardNavigation key={project.id} id={project.id} name={project.name} url={`/projects/${project.id}`} />
                <IconButton color="primary" onClick={() => setIsOpen(true)}>
                  <MoreVert />
                </IconButton>
              </div>
            ))}
          </Box>
        </Box>
      </Container>
    </>
  );
};

Projects.getLayout = getLayout;

export default Projects;

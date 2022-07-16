import type { NextPage } from 'next';
import Head from 'next/head';

import { Box, Container, Typography } from '@mui/material';

import Layout from '@components/Layout';
import Card from '@components/Card';

const Projects: NextPage = () => {
  const resultMock = [
    {
      id: 1,
      name: '2022-1-MeasureSoftGram-Front'
    }
  ];

  return (
    <Layout>
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
              <Card key={project.id} id={project.id} name={project.name} url={`/projects/${project.id}`} />
            ))}
          </Box>
        </Box>
      </Container>
    </Layout>
  );
};

export default Projects;

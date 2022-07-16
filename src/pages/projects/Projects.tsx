import type { NextPage } from 'next';
import Head from 'next/head';

import { Box, Container, Typography } from '@mui/material';

import Layout from '@components/Layout';

import ProjectsCards from './components/ProjectsCards';

const Projects: NextPage = () => {
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

          <ProjectsCards />
        </Box>
      </Container>
    </Layout>
  );
};

export default Projects;

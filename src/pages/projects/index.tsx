import React from 'react';
import { NextPage } from 'next';
import { ProjectProvider } from './contexts/ProjectProvider';
import ProjectsPage from './Projects';

const Projects: NextPage = () => (
  <ProjectProvider>
    <ProjectsPage />
  </ProjectProvider>
);

export default Projects;

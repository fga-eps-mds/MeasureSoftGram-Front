import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import { formatRelative } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Box, Typography } from '@mui/material';

import { projectQuery } from '@services/index';

import Skeleton from './Skeleton';

import * as Styles from './styles';

interface Project {
  id: number;
  name: string;
  description: string;
  github_url: string;
  created_at: string;
  updated_at: string;
}

const ProjectContent = () => {
  const { query } = useRouter();
  const [project, setProject] = useState<Project>();

  async function loadQuery() {
    if (query?.project) {
      try {
        const result = await projectQuery.getProjectById('1', query?.project as string);
        setProject(result.data);
      } catch (error) {
        return error;
      }
    }
  }

  useEffect(() => {
    loadQuery();
  }, [query?.project]);

  const lastUpdateDate =
    project &&
    formatRelative(new Date(project.updated_at), new Date(), {
      locale: ptBR
    });

  if (!project) {
    return <Skeleton />;
  }

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="row" alignItems="center" marginY="60px">
        <Styles.Circle />

        <Box>
          <Typography variant="h6">{project?.name}</Typography>
          <Typography variant="caption">última atualização: {lastUpdateDate}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ProjectContent;

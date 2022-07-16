import React from 'react';

import { formatRelative } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Box, Typography } from '@mui/material';

import Skeleton from './Skeleton';

import * as Styles from './styles';
import useQuery from './hook/useQuery';

const ProjectContent = () => {
  const { project } = useQuery();

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

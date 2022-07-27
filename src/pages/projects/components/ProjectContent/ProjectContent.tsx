import React from 'react';

import { formatRelative } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Box, Typography } from '@mui/material';

import Skeleton from '../Skeleton';

import Circle from './styles';

const ProjectContent = (props: any) => {
  const lastUpdateDate =
    props.project &&
    formatRelative(new Date(props.project.updated_at), new Date(), {
      locale: ptBR
    });

  if (!props.project) {
    return <Skeleton />;
  }

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="row" alignItems="center" marginY="60px">
        <Circle />

        <Box>
          <Typography variant="h6">{props.project?.name}</Typography>
          <Typography variant="caption">última atualização: {lastUpdateDate}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ProjectContent;

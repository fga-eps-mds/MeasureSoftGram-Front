import React, { useState } from 'react';

import { formatRelative } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Box, Typography } from '@mui/material';

import { Project } from '@customTypes/project';

import CreateRelease from '@pages/createRelease';
import Skeleton from '../Skeleton';

import Circle from './styles';

interface Props {
  project?: Project;
}

const ProjectContent: React.FC<Props> = ({ project }) => {
  const [openCreateRelease, setOpenCreateRelease] = useState(false);

  const lastUpdateDate =
    project &&
    formatRelative(new Date(), new Date(), {
      locale: ptBR
    });

  if (!project) {
    return <Skeleton />;
  }

  return (
    <>
      <Box display="flex" flexDirection="column">
        <Box display="flex" flexDirection="row" alignItems="center" marginY="60px">
          <Circle />

          <Box>
            <Typography variant="h6">{project?.name}</Typography>
            <Typography variant="caption">última atualização: {lastUpdateDate}</Typography>
          </Box>

        </Box>
      </Box>
      <button
        type="button"
        onClick={() => setOpenCreateRelease(true)}
      >Definir release</button>


      <CreateRelease
        open={openCreateRelease}
        handleClose={() => setOpenCreateRelease(false)}
        projectId={3}
        organizationId={1}
      />
    </>
  );
};

export default ProjectContent;

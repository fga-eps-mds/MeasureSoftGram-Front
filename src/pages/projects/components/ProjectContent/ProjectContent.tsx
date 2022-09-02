import React, { useEffect, useState } from 'react';

import { formatRelative } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Box, IconButton, Menu, MenuItem, Typography } from '@mui/material';

import { Project } from '@customTypes/project';

import Filters from '@components/Filters';

import CreateRelease from '@pages/createRelease';
import { MoreVert } from '@mui/icons-material';
import GraphicStackedLine from '@components/GraphicStackedLine';
import { supportedEntitiesQuery } from '@services/supportedEntities';
import axios from 'axios';
import Skeleton from '../Skeleton';

import { BodyContainer, Circle, FiltersContainer, GraphicContainer } from './styles';

interface Props {
  project?: Project;
}

const ProjectContent: React.FC<Props> = ({ project }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const [openCreateRelease, setOpenCreateRelease] = useState(false);

  const [filterCharacteristics, setFilterCharacteristics] = useState({ filterTitle: 'CARACTERÍSTICAS', options: [] });
  const [filterSubCharacteristics, setFilterSubCharacteristics] = useState({
    filterTitle: 'SUB CARACTERÍSTICAS',
    options: []
  });

  useEffect(() => {
    axios
      .all([
        supportedEntitiesQuery.getSupportedEntities('characteristics'),
        supportedEntitiesQuery.getSupportedEntities('subcharacteristics')
      ])
      .then((res) => {
        const results = res.map((result) => result.data.results);

        setFilterCharacteristics({ ...filterCharacteristics, options: results[0] });
        setFilterSubCharacteristics({ ...filterSubCharacteristics, options: results[1] });
      });
  }, []);

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleOpenCreateRelease = () => {
    setOpenCreateRelease(true);
    setAnchorEl(null);
  };

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

          <IconButton color="primary" onClick={handleOpenMenu}>
            <MoreVert />
          </IconButton>
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleCloseMenu}
            MenuListProps={{
              'aria-labelledby': 'basic-button'
            }}
          >
            <MenuItem onClick={handleOpenCreateRelease}>Definir release</MenuItem>
          </Menu>
        </Box>
      </Box>

      <BodyContainer display="flex" width="100%" flexDirection="row">
        <FiltersContainer display="flex" width="30%" flexDirection="column">
          {[filterCharacteristics, filterSubCharacteristics].map((filter) => (
            <Filters key={filter.filterTitle} filterTitle={filter.filterTitle} options={filter.options} />
          ))}
        </FiltersContainer>

        <GraphicContainer display="flex" width="100%" justifyContent="center" alignItems="center">
          <GraphicStackedLine />
        </GraphicContainer>
      </BodyContainer>

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

import React, { useState } from 'react';
import Head from 'next/head';

import { Box, Container, IconButton, Menu, MenuItem, Typography } from '@mui/material';

import { NextPageWithLayout } from '@pages/_app.next';

import getLayout from '@components/Layout';
import CardNavigation from '@components/CardNavigation';
import ConfigPage from '@pages/preConfig/ConfigPage';
import { MoreVert } from '@mui/icons-material';

const Projects: NextPageWithLayout = () => {
  const [openConfig, setOpenConfig] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleOpenConfig = () => {
    setOpenConfig(true);
    setAnchorEl(null);
  };

  const resultMock = [
    {
      id: 3,
      name: '2022-1-MeasureSoftGram-Front'
    }
  ];

  return (
    <>
      <Head>
        <title>MeasureSoftGram - Projetos</title>
      </Head>
      <Container>
        <ConfigPage isOpen={openConfig} onClose={setOpenConfig} repoName={resultMock[0].name} />
        <Box display="flex" flexDirection="column">
          <Box marginY="60px">
            <Typography variant="h5">Projetos</Typography>
          </Box>
          <Box display="flex">
            {resultMock.map((project) => (
              <div key={project.id} style={{ display: 'flex', flexDirection: 'row' }}>
                <CardNavigation key={project.id} id={project.id} name={project.name} url={`/projects/${project.id}`} />
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
                  <MenuItem onClick={handleOpenConfig}>Definir pré configurações</MenuItem>
                </Menu>
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

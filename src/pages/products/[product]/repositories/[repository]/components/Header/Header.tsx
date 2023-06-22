import { useRepositoryContext } from '@contexts/RepositoryProvider';
import { Box, Typography } from '@mui/material';

import React from 'react';

function Header() {
  const { currentRepository } = useRepositoryContext();

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex">
        <Typography variant="h4" marginRight="10px">
          Repositório
        </Typography>
        <Typography variant="h4" fontWeight="300">
          {currentRepository?.name}
        </Typography>
      </Box>
      <Typography variant="caption" color="gray">
        {currentRepository?.description}
      </Typography>
    </Box>
  );
}

export default Header;

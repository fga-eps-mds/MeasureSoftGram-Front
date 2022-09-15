import React from 'react';

import { Box, Skeleton as Shimmer } from '@mui/material';

function Skeleton() {
  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="row" alignItems="center" marginY="60px">
        <Box>
          <Shimmer variant="text" height={34} width={400} />
          <Shimmer variant="text" height={14} width={200} />
        </Box>
      </Box>
    </Box>
  );
}

export default Skeleton;

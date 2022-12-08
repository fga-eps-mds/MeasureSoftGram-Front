import React from 'react';

import { Box, Skeleton as Shimmer } from '@mui/material';

function Skeleton() {
  return (
    <Box>
      <Shimmer variant="text" height={64} width={300} />
      <Shimmer variant="text" height={32} width={600} />
    </Box>
  );
}

export default Skeleton;

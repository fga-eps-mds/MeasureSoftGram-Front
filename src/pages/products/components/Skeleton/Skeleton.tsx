import React from 'react';

import { Box, Skeleton as Shimmer } from '@mui/material';

function Skeleton() {
  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="row" alignItems="center" marginTop="35px" marginBottom="25px">
        <Box>
          <Shimmer data-testid="primeiro-shimmer" variant="text" height={65} width={300} />
        </Box>
      </Box>
      <Box marginBottom="10px" display="flex" alignItems="center">
        <Box marginRight="10px">
          <Shimmer variant="text" height={60} width={250} />
        </Box>
        <Shimmer variant="circular" height={40} width={40} />
      </Box>
    </Box>
  );
}

export default Skeleton;

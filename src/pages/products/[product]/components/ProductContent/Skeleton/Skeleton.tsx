import React from 'react';

import { Box, Skeleton as Shimmer } from '@mui/material';

function Skeleton() {
  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="row" alignItems="center" marginTop="40px" marginBottom="24px">
        <Box>
          <Shimmer variant="text" height={50} width={400} />
          <Shimmer variant="text" height={16} width={200} />
        </Box>
      </Box>
      <Box marginBottom="10px" display="flex" justifyContent="end">
        <Shimmer variant="text" height={45} width={150} />
      </Box>
      <Shimmer variant="rectangular" height={480} />
    </Box>
  );
}

export default Skeleton;

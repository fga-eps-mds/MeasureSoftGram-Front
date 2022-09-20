import React from 'react';
import { range } from 'lodash';

import { Box, Container, Skeleton as Shimmer } from '@mui/material';

import * as Styles from '../../styles';

function Skeleton() {
  return (
    <Box display="flex" width="100%" flexDirection="row">
      <Styles.FilterBackground>
        <Box display="flex" paddingX="15px" flexDirection="column" marginTop="36px" position="fixed">
          {range(2).map(() => (
            <Box paddingBottom="10px">
              <Shimmer variant="text" height={32} width={200} />
              <Box display="flex" flexDirection="column" alignItems="end">
                <Shimmer variant="text" height={25} width={180} />
                <Shimmer variant="text" height={25} width={180} />
              </Box>
            </Box>
          ))}
        </Box>
      </Styles.FilterBackground>

      <Container>
        <Box display="flex" flexDirection="row" alignItems="center" marginTop="40px" marginBottom="36px">
          <Box>
            <Shimmer variant="text" height={50} width={400} />
            <Shimmer variant="text" height={16} width={200} />
          </Box>
        </Box>

        <Box>
          <Shimmer variant="rectangular" height={280} />
        </Box>
      </Container>
    </Box>
  );
}

export default Skeleton;

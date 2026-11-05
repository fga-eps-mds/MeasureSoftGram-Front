import React from 'react';
import range from 'lodash/range';

import { Box, Container, Skeleton as Shimmer } from '@mui/material';

import * as Styles from '../styles';

function Skeleton() {
  return (
    <Box display="flex" flexDirection="column" marginTop="42px">
      <Styles.Wrapper>
        <Container>
          <Box marginBottom="32px">
            <Shimmer data-testid="skeleton" variant="text" height={50} width={150} />
          </Box>
          <Box marginBottom="32px">
            {range(5).map((i) => (
              <Box key={i} marginBottom="2px">
                <Shimmer variant="rectangular" height={45} />
              </Box>
            ))}
          </Box>
        </Container>
      </Styles.Wrapper>
    </Box>
  );
}

export default Skeleton;

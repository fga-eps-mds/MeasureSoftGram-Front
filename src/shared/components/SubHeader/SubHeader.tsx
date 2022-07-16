import React from 'react';

import { Box, Button, Container, Typography } from '@mui/material';

import * as Styles from './styles';

function SubHeader() {
  const options = [
    {
      name: 'Medidas'
    },
    {
      name: 'Métricas'
    }
  ];

  return (
    <Styles.Wrapper>
      <Container>
        <Box display="flex">
          {options.map((option) => {
            return (
              <Styles.Button>
                <Typography variant="subtitle2">{option.name}</Typography>
              </Styles.Button>
            );
          })}
        </Box>
      </Container>
    </Styles.Wrapper>
  );
}

export default SubHeader;

import React from 'react';
import { Box, Button } from '@mui/material';
import * as Styles from './styles';

export default function ReleaseConfigSelector() {
  return (
    <>
      <Styles.Header>
        <h1>Planejar Release</h1>
      </Styles.Header>
      <Box display="flex" flexDirection="column">
        <Button variant="contained" color="secondary" style={{ marginBottom: '20px' }}>
          Seguir última configuração
        </Button>
        <Button variant="outlined">Alterar configuração</Button>
      </Box>
    </>
  );
}

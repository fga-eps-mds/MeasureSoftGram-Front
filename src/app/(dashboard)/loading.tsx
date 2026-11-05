import React from 'react';
import { Box, CircularProgress } from '@mui/material';

// Aparece no lugar da página enquanto a rota seguinte carrega; o menu e o cabeçalho do Layout continuam na tela.
export default function Loading() {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" width="100%" minHeight="50vh">
      <CircularProgress sx={{ color: '#33568E' }} aria-label="loading" />
    </Box>
  );
}

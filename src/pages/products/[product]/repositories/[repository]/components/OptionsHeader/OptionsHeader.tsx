import { Box, Button } from '@mui/material';

import React from 'react';

interface Props {
  title: string;
  isHistoricOpen: boolean;
  setIsHistoricOpen: (arg: boolean) => void;
}

function OptionsHeader({ title, isHistoricOpen, setIsHistoricOpen }: Props) {
  return (
    <Box
      display="flex"
      flexDirection="row"
      height={60}
      alignItems="center"
      justifyContent="space-between"
      gap="2rem"
    >
      <h2 style={{ color: '#113D4C', fontWeight: '500', fontSize: '25px' }}>{title}</h2>
      <Box
        style={{
          width: '50%'
        }}
        display="flex"
        flexDirection="row"
        justifyContent="flex-end"
        gap="1rem"
      >
        <Button
          onClick={() => setIsHistoricOpen(true)}
          variant={isHistoricOpen ? 'contained' : 'outlined'}
        >
          Histórico
        </Button>
        <Button
          onClick={() => setIsHistoricOpen(false)}
          variant={!isHistoricOpen ? 'contained' : 'outlined'}
        >
          Cenário Atual
        </Button>
      </Box>
    </Box >
  );
}

export default OptionsHeader;

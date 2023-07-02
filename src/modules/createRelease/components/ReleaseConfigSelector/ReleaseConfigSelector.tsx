import React from 'react';
import { Box, Button } from '@mui/material';
import { useCreateReleaseContext } from '@modules/createRelease/context/useCreateRelease';
import { CREATE_RELEASE_STEP } from '@modules/createRelease/consts';
import * as Styles from './styles';

interface ReleaseConfigSelectorProps {
  setActiveStep: (step: number) => void;
}

export default function ReleaseConfigSelector({ setActiveStep }: ReleaseConfigSelectorProps) {
  const { setUseLastConfig } = useCreateReleaseContext();

  const useLastConfig = () => {
    setActiveStep(CREATE_RELEASE_STEP.ReleaseGoalStep);
    setUseLastConfig(true);
  };

  return (
    <>
      <Styles.Header>
        <h1>Planejar Release</h1>
      </Styles.Header>
      <Box display="flex" flexDirection="column">
        <Button variant="contained" color="secondary" style={{ marginBottom: '20px' }} onClick={useLastConfig}>
          Seguir última configuração
        </Button>
        <Button variant="outlined" onClick={() => setActiveStep(CREATE_RELEASE_STEP.CharacteristicStep)}>
          Alterar configuração
        </Button>
      </Box>
    </>
  );
}

import React from 'react';
import { useCreateReleaseContext } from '@modules/createRelease/context/useCreateRelease';
import { CREATE_RELEASE_STEP } from '@modules/createRelease/consts';
import * as Styles from './styles';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import TuneIcon from '@mui/icons-material/Tune';
import { Button } from '@mui/material';

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
        <h1 style={{ color: '#33568E', fontWeight: '500' }}>Planejar Release</h1>
      </Styles.Header>
      <Styles.Body>
        <Button onClick={useLastConfig} variant="outlined" startIcon={<SkipNextIcon></SkipNextIcon>}
          sx={{
            backgroundColor: "#fff",
            color: "#113d4c",
            '&:hover': {
              backgroundColor: "#73bfb8",
              color: "#fff"
            },
            padding: '20px',
            marginBottom: '30px'
          }}>
          Seguir a última configuração
        </Button>
        <Button onClick={useLastConfig} variant="outlined" startIcon={<TuneIcon></TuneIcon>}
          sx={{
            backgroundColor: "#fff",
            color: "#113d4c",
            '&:hover': {
              backgroundColor: "#73bfb8",
              color: "#fff"
            },
            padding: '20px'
          }}>
          Alterar configuração
        </Button>
      </Styles.Body>
    </>
  );
}
